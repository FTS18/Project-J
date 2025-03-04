import json
import re

def process_colleges(city_state_json_file, college_json_file, output_file):
    """
    Reads cities and states from a JSON, college names from another JSON,
    and creates a new JSON with college details (name, city, state).
    Only adds city and state to colleges in college_json_file that lack them.

    Args:
        city_state_json_file (str): Path to the JSON file containing cities and states.
        college_json_file (str): Path to the JSON file containing college names.
        output_file (str): Path to the output JSON file.
    """

    try:
        with open(city_state_json_file, 'r', encoding='utf-8') as f:
            city_state_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: City-state JSON file '{city_state_json_file}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{city_state_json_file}'.")
        return
    except Exception as e:
        print(f"An error occurred while reading the city-state JSON: {e}")
        return

    try:
        with open(college_json_file, 'r', encoding='utf-8') as f:
            colleges = json.load(f)
    except FileNotFoundError:
        print(f"Error: College JSON file '{college_json_file}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{college_json_file}'.")
        return
    except Exception as e:
        print(f"An error occurred while reading the college JSON: {e}")
        return

    college_details = []
    for college in colleges:
        if "city" not in college or "state" not in college:
            found_location = False
            for state, cities in city_state_data.items():
                for city in cities:
                    if re.search(r'\b' + re.escape(city.lower()) + r'\b', college["institute"].lower()):
                        college["city"] = city
                        college["state"] = state
                        found_location = True
                        break
                if found_location:
                    break
        college_details.append(college)

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(college_details, f, indent=4)
        print(f"College details saved to '{output_file}'.")
    except Exception as e:
        print(f"An error occurred while writing to the output file: {e}")

# Example usage:
city_state_json_file = 'cs.json'
college_json_file = 'data.json'
output_file = 's.json'

process_colleges(city_state_json_file, college_json_file, output_file)