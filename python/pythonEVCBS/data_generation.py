import pandas as pd
import random
from datetime import datetime, timedelta

data = []
start = datetime(2025, 1, 1, 0, 0)

for i in range(100000):  # more data = better model
    dt = start + timedelta(hours=i)

    demand = random.randint(1, 90)
    station_load = round(demand / 90, 2)

    vehicle = random.choice(['2W', '3W', '4W'])

    hour = dt.hour
    day = dt.day
    weekday = dt.weekday()

    # STRONG REALISTIC PRICING FORMULA
    price = (
        12
        + demand * 0.4                   # strong demand effect
        + station_load * 10              # congestion pricing
        + (hour in [7,8,9,17,18,19,20]) * 5   # peak hours more expensive
        + {"2W":0,"3W":2,"4W":4}[vehicle]     # bigger vehicles cost more
        + random.uniform(-2, 2)               # noise
    )

    price = round(price, 2)

    data.append([dt, demand, station_load, vehicle, hour, day, weekday, price])

df = pd.DataFrame(data, columns=[
    "date_time", "demand", "station_load",
    "vehicle_type", "hour", "day", "weekday", "price"
])

df.to_csv("historical_pricing.csv", index=False)
print("Dataset generated!")
