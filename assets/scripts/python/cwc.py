import json

def extract_unique_missing_colleges(data_file, output_file):
    """
    Extracts unique college names from a JSON file that are missing 
    city and state attributes, and creates a new JSON with 
    institute, city, and state attributes (city and state left blank).

    Args:
        data_file (str): Path to the input JSON file.
        output_file (str): Path to the output JSON file.
    """

    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Data file '{data_file}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{data_file}'.")
        return
    except Exception as e:
        print(f"An error occurred while reading the data JSON: {e}")
        return

    unique_colleges = {}  # Use a dictionary to track uniqueness
    for college in data:
        institute_name = college["institute"].strip()
        if "city" not in college or "state" not in college:
            unique_colleges[institute_name] = {"institute": institute_name, "city": "", "state": ""}

    unique_colleges_list = list(unique_colleges.values())  # Convert to a list of dictionaries

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unique_colleges_list, f, indent=4)
        print(f"Unique colleges without city/state saved to '{output_file}'.")
    except Exception as e:
        print(f"An error occurred while writing to the output file: {e}")

# Example Usage
data_file = 's.json'
output_file = 'unique_missing_colleges.json'
extract_unique_missing_colleges(data_file, output_file)