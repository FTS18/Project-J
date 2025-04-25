import csv
import json
import io
import random

def convert_nsut_csv_to_json(csv_file_path):
    """
    Converts NSUT cutoff data from a CSV file to a list of JSON objects,
    applying category and branch name transformations, and adding opening ranks.

    Args:
        csv_file_path (str): The path to the NSUT cutoff data CSV file.

    Returns:
        None
    """

    nsut_data = []
    with open(csv_file_path, 'r', newline='') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        branch_names = {
            "CSAI": "Computer Science and Engineering (Artificial Intelligence)",
            "CSE": "Computer Science and Engineering",
            "CSDS": "Computer Science and Engineering (Data Science)",
            "IT": "Information Technology",
            "ITNS": "Information Technology (Network and Information Security)",
            "MAC": "Mathematics and Computing",
            "ECE": "Electronics and Communication Engineering",
            "EVDT": "Electronics Engineering (VLSI Design and Technology)",
            "EE": "Electrical Engineering",
            "ICE": "Instrumentation and Control Engineering",
            "ME": "Mechanical Engineering",
            "BT": "Bio-Technology",
            "CSDA": "Computer Science and Engineering (Big Data Analytics)",
            "CIOT": "Computer Science and Engineering (Internet of Things)",
            "ECAM": "Electronics and Communication Engineering (Artificial Intelligence and Machine Leaming)",
            "MEEV**": "Mechanical Engineering (Electric Vehicles)",
            "CE**": "Civil Engineering",
            "GI": "Geoinformatics",
            "B.Arch.**": "Bachelor of Architecture"
        }

        for row in csv_reader:
            category_code = row["category_code"].strip()  # VERY IMPORTANT: Remove leading/trailing spaces!
            print(f"Processing category code: '{category_code}'")  # Debug print
            category = get_category(category_code)
            quota = get_quota(category_code)

            if category and quota:  # Only process if category and quota are valid
                closing_rank = int(row["closingRank"])
                opening_rank = calculate_opening_rank(closing_rank)

                nsut_data.append({
                    "institute": row["institute"],
                    "branch": branch_names.get(row["branch"], row["branch"]),  # Use full branch name
                    "quota": quota,
                    "category": category,
                    "gender": "Gender-Neutral",
                    "openingRank": str(opening_rank),  # Convert to string
                    "closingRank": row["closingRank"],
                    "city": row["city"],
                    "state": row["state"],
                    "type": row["type"]
                })

    # Save to nsut.json
    with open("nsut.json", "w", encoding="utf-8") as json_file:
        json.dump(nsut_data, json_file, indent=4)


def get_category(category_code):
    """
    Determines the category from the category code.

    Args:
        category_code (str): The category code (e.g., GNGND, EWGLO).

    Returns:
        str: The category (e.g., OPEN, EWS, SC, ST), or None if not recognized.
    """
    if category_code.startswith("GN"):
        return "OPEN"
    elif category_code.startswith("EW"):
        return "EWS"
    elif category_code.startswith("SC"):
        return "SC"
    elif category_code.startswith("ST"):
        return "ST"
    else:
        return None


def get_quota(category_code):
    """
    Determines the quota (HS or OS) from the category code.

    Args:
        category_code (str): The category code (e.g., GNGND, EWGLO).

    Returns:
        str: The quota ("HS" or "OS"), or None if not recognized.
    """
    if category_code[-1] == "D":
        return "HS"
    elif category_code[-1] == "L" or category_code[-1] == "O":  # Added 'O' check
        return "OS"
    else:
        return None

def calculate_opening_rank(closing_rank):
    """
    Calculates the opening rank based on the closing rank with a 20-30% random variation.

    Args:
        closing_rank (int): The closing rank.

    Returns:
        int: The calculated opening rank.
    """
    lower_bound = 0.7  # 70% of closing rank (30% reduction)
    upper_bound = 0.8  # 80% of closing rank (20% reduction)
    random_percentage = random.uniform(lower_bound, upper_bound)
    opening_rank = int(closing_rank * random_percentage)
    return opening_rank


# --- Main Execution ---
csv_file_path = "nsut.csv"  # Replace with the actual path to your nsut.csv file
convert_nsut_csv_to_json(csv_file_path)
print("JSON data saved to nsut.json")