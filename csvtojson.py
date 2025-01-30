import csv
import json

# Input and output file paths
csv_file = 'data.csv'  # Replace with your CSV file path
json_file = 'data.json'  # Output JSON file path

# List to hold the JSON data
data = []

# Read the CSV file
with open(csv_file, mode='r', newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        # Skip rows where the Quota contains "PwD" (excluding all PwD categories)
        if "PwD" in row["Quota"]:
            continue
        
        # Directly append the row as a dictionary without modifying ranks
        data.append({
            "institute": row["Institute"],
            "branch": row["Branch"],
            "quota": row["Quota"],
            "category": row["Category"],
            "gender": row["Gender"],
            "openingRank": row["Opening Rank"],
            "closingRank": row["Closing Rank"]
        })

# Write the JSON data to a file
with open(json_file, 'w', encoding='utf-8') as json_out:
    json.dump(data, json_out, indent=4)

print(f"CSV data has been converted to {json_file} (excluding all PwD candidates)")
