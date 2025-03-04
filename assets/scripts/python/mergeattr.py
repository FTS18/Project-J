import json

def merge_data_all(college_details_json, data_json, output_file):
    """
    Merges data from two JSON files, adding city and state to all entries in data_json.

    Args:
        college_details_json (str): Path to the JSON file containing college details.
        data_json (str): Path to the JSON file containing additional information.
        output_file (str): Path to the output JSON file.
    """

    try:
        with open(college_details_json, 'r', encoding='utf-8') as f:
            college_details = json.load(f)
    except FileNotFoundError:
        print(f"Error: College details JSON file '{college_details_json}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{college_details_json}'.")
        return
    except Exception as e:
        print(f"An error occurred while reading the college details JSON: {e}")
        return

    try:
        with open(data_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Data JSON file '{data_json}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{data_json}'.")
        return
    except Exception as e:
        print(f"An error occurred while reading the data JSON: {e}")
        return

    merged_data = []
    for data_entry in data:
        found_match = False
        for college_detail in college_details:
            if college_detail["institute"].strip() == data_entry["institute"].strip():
                merged_data.append({
                    **data_entry,
                    "city": college_detail["city"],
                    "state": college_detail["state"]
                })
                found_match = True
                break
        if not found_match:
            merged_data.append(data_entry) # If no match, add the original data_entry.

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, indent=4)
        print(f"Merged data saved to '{output_file}'.")
    except Exception as e:
        print(f"An error occurred while writing to the output file: {e}")

# Example usage:
college_details_json = 'cdetails.json'
data_json = 'data.json'
output_file = 'merged_data_all.json'

merge_data_all(college_details_json, data_json, output_file)