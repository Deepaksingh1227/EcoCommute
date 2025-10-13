"""
Train a small regression model on synthetic traffic data and save it.

Model input features expected by the API:
 - distance_km (float)
 - hour_of_day (int 0..23)
 - mode_code (int): 0=car,1=cycle,2=foot

The model predicts travel duration in minutes (float).
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

def generate_synthetic(n=5000, random_state=42):
    rng = np.random.RandomState(random_state)
    # distance between 0.5km and 40km
    distance = rng.uniform(0.5, 40.0, size=n)
    hour = rng.randint(0, 24, size=n)
    # modes: 0=car (60%), 1=cycle (30%), 2=foot (10%)
    mode = rng.choice([0,1,2], size=n, p=[0.6,0.3,0.1])

    # base speeds (km/h) with noise
    speeds = np.where(mode==0, rng.normal(35,6,n),
                     np.where(mode==1, rng.normal(14,2,n), rng.normal(5,1,n)))
    speeds = np.clip(speeds, 3, None)

    # rush-hour penalty factor (morning 7-9, evening 17-19)
    rush = ((hour >= 7) & (hour <=9)) | ((hour >= 17) & (hour <=19))
    rush_factor = 1 + 0.25 * rush.astype(int)  # 25% slower in rush

    # random perturbation
    noise = rng.normal(0, 1.5, size=n)  # minutes noise

    duration = (distance / speeds) * 60 * rush_factor + noise
    duration = np.maximum(duration, 1.0)

    df = pd.DataFrame({
        'distance_km': distance,
        'hour_of_day': hour,
        'mode_code': mode,
        'duration_min': duration
    })
    return df

def train_and_save(path='model/model.bin'):
    print("Generating synthetic data...")
    df = generate_synthetic()
    X = df[['distance_km', 'hour_of_day', 'mode_code']].values
    y = df['duration_min'].values
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X, y)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(model, path)
    print(f"Model saved to {path}")

if __name__ == '__main__':
    train_and_save()
