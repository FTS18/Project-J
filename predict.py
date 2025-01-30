import numpy as np
import matplotlib.pyplot as plt

# Example data (Marks vs Percentile)
marks = np.array([0, 60, 80, 120, 150, 180, 200, 240, 300])
percentile = np.array([0, 50, 85, 93, 97, 99, 99.5, 99.9, 100])

# Fit a polynomial regression model (degree 3 for flexibility)
coefficients = np.polyfit(marks, percentile, 100)
model = np.poly1d(coefficients)

# Plotting the data and fit
marks_range = np.linspace(0, 300, 500)
predicted_percentiles = model(marks_range)

plt.scatter(marks, percentile, color='blue', label='Actual Data')
plt.plot(marks_range, predicted_percentiles, color='red', label='Fitted Curve')
plt.title('JEE Marks vs Percentile Prediction')
plt.xlabel('Marks')
plt.ylabel('Percentile')
plt.legend()
plt.grid()
plt.show()

# Prediction for specific marks
new_marks = np.array([150, 180, 200, 220, 250])
predicted_percentiles = model(new_marks)
for m, p in zip(new_marks, predicted_percentiles):
    print(f"Marks: {m}, Predicted Percentile: {p:.2f}%")
