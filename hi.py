from bs4 import BeautifulSoup
import csv

html_file_path = "xyz.html"
output_csv_path = "data.csv"

with open(html_file_path, "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")

rows = soup.find_all("tr")

data = []

for row in rows[1:]:
    columns = row.find_all("td")
    if len(columns) == 7:
        institute = columns[0].text.strip()
        branch = columns[1].text.strip()
        quota = columns[2].text.strip()
        category = columns[3].text.strip()
        gender = columns[4].text.strip()
        open_rank = columns[5].text.strip()
        close_rank = columns[6].text.strip()
        data.append([institute, branch, quota, category, gender, open_rank, close_rank])

with open(output_csv_path, "w", newline="", encoding="utf-8") as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow(["Institute", "Branch", "Quota", "Category", "Gender", "Opening Rank", "Closing Rank"])
    writer.writerows(data)

print(f"Data extraction complete. CSV file saved as '{output_csv_path}'.")
