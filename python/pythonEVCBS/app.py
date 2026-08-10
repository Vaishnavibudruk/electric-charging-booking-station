# pricing_api.py
from flask import Flask, request, jsonify
import joblib
import pandas as pd
from datetime import datetime

app = Flask(__name__)

# Load trained model
model = joblib.load("pricing_model_xgb2.pkl")  # adjust path if needed

@app.route('/predict', methods=['POST'])
def predict_price():
    try:
        data = request.get_json()

        # Auto-generate time fields if missing
        now = datetime.now()
        hour = data.get("hour", now.hour)
        day = data.get("day", now.day)
        weekday = data.get("weekday", now.weekday())

        # Extract input features with defaults
        demand = float(data.get("demand", 0))
        station_load = float(data.get("station_load", 0))
        vehicle_type =  data.get("vehicle_type")

        # Prepare dataframe
        df = pd.DataFrame([{
            "demand": demand,
            "station_load": station_load,
            "vehicle_type": vehicle_type,
            "hour": int(hour),
            "day": int(day),
            "weekday": int(weekday)
        }])

        # Predict
        predicted_price = model.predict(df)[0]

        return jsonify({"predicted_price": float(predicted_price)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6001, debug=True)
