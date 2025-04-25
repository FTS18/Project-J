import json
from bs4 import BeautifulSoup
import pandas as pd

def extract_round_four_data_refined(html_content):

    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', {'id': 'ORCRGridView'})
    round_four_data = []

    if table:
        tbody = table.find('tbody')
        if tbody:
            rows = tbody.find_all('tr')
            df = pd.read_html(str(table))[0]  # Use pandas for easier row-wise processing

            for index, row in df.iterrows():
                if row['Round'] == 'Round 4':
                    institute = row['Institute']
                    branch_raw = f"{row['Program']} ({row['Stream']})"

                    # Skip branches with (FW)
                    if "(FW)" in branch_raw:
                        continue

                    branch = branch_raw.replace(' (FW)', '').strip()
                    quota = "HS" if row['Quota'] == 'Home State' else ("AI" if row['Quota'] == 'All India' else row['Quota'])
                    category_raw = row['Category']
                    gender_raw = row['Seat Gender']

                    # Filter out unwanted category types
                    if '(AF)' in category_raw or '(PH)' in category_raw or '(FF)' in category_raw or '(TF)' in category_raw:
                        continue

                    gender = "Gender-Neutral"
                    category = category_raw.replace('(GL)', '').replace('(OPEN)', '')  # Remove potential indicators

                    if "Female" in gender_raw and "Male" not in gender_raw:
                        gender = "Female-only (including Supernumerary)"
                    elif category_raw.startswith('EWS') and "(GL)" in category_raw:
                        gender = "Female-only (including Supernumerary)"
                        category = "EWS"
                    elif "(girl)" in category_raw.lower():
                        gender = "Female-only (including Supernumerary)"

                    category = category.replace('(Girl)', '').strip() # Remove (Girl) after setting gender

                    if category_raw.startswith('BC'):
                        category = 'OBC-NCL'
                    elif category_raw.startswith('EWS'):
                        category = 'EWS'
                    elif category_raw.startswith('OPEN'):
                        category = 'OPEN'


                    opening_rank = str(int(float(row['Opening Rank']))) if pd.notna(row['Opening Rank']) else None
                    closing_rank = str(int(float(row['Closing Rank']))) if pd.notna(row['Closing Rank']) else None
                    city_parts = institute.split(',')
                    city = city_parts[-1].strip().title() if len(city_parts) > 1 else None

                    round_four_data.append({
                        "round": row['Round'],
                        "institute": institute,
                        "branch": branch,
                        "quota": quota,
                        "category": category.strip(),
                        "gender": gender,
                        "openingRank": opening_rank,
                        "closingRank": closing_rank,
                        "city": city,
                        "state": "Uttar Pradesh",
                        "type": "AKTU"
                    })
    return round_four_data

def save_to_json(data, filename="aktu_round4_final_filter.json"):
    """
    Saves the given data to a JSON file.

    Args:
        data: A list of dictionaries to be saved.
        filename: The name of the JSON file to create.
    """
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    file_path = 'AKTU.HTML'
    output_file = 'aktu_round4_final_filter.json'

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        round_four_data = extract_round_four_data_refined(html_content)
        save_to_json(round_four_data, output_file)

        print(f"Successfully extracted and refined Round 4 data, saved to '{output_file}'")

    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")