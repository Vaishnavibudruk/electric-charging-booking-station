import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error
from xgboost import XGBRegressor
import joblib

# 1. Load Dataset
df = pd.read_csv("historical_pricing.csv")

# 2. Convert datetime to useful features
df['date_time'] = pd.to_datetime(df['date_time'])
df['hour'] = df['date_time'].dt.hour
df['day'] = df['date_time'].dt.day
df['weekday'] = df['date_time'].dt.weekday

# 3. Features & Target
X = df[['demand','station_load', 'vehicle_type', 'hour', 'day', 'weekday']]
y = df['price']

# 4. Preprocessing for categorical data
categorical_features = ['vehicle_type']
numeric_features = ['demand', 'station_load', 'hour', 'day', 'weekday']

preprocess = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', 'passthrough', numeric_features)
    ]
)

# 5. XGBoost Model (much better than RandomForest)
model = XGBRegressor(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
    objective='reg:squarederror'
)

# 6. Build Pipeline
pipeline = Pipeline(steps=[
    ('preprocess', preprocess),
    ('model', model)
])

# 7. Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

# 8. Train model
pipeline.fit(X_train, y_train)

# 9. Evaluate
preds = pipeline.predict(X_test)
mae = mean_absolute_error(y_test, preds)

print("XGBoost Model trained successfully!")
print("Mean Absolute Error:", mae)

# 10. Save Model
joblib.dump(pipeline, "pricing_model_xgb.pkl")
print("Model saved as pricing_model_xgb.pkl")
