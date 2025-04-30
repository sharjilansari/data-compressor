import json
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import os

from openpyxl.drawing.image import Image
from openpyxl.utils import get_column_letter

def analyze_compression_logs():
    log_file = 'logs/combined.log'
    compression_data = []

    with open(log_file, 'r') as f:
        for line in f:
            try:
                log_entry = json.loads(line.strip())
                if log_entry.get('level') == 'info' and 'Compression completed' in log_entry.get('message', ''):
                    timestamp = datetime.fromisoformat(log_entry['timestamp'].replace('Z', '+00:00')).replace(tzinfo=None)
                    compression_data.append({
                        'timestamp': timestamp,
                        'filename': log_entry['filename'],
                        'algorithm': log_entry['algorithm'],
                        'original_size': log_entry['originalSize'],
                        'compressed_size': log_entry['compressedSize'],
                        'compression_ratio': float(log_entry['ratio']),
                        'savings_percentage': (1 - (log_entry['compressedSize'] / log_entry['originalSize'])) * 100
                    })
            except json.JSONDecodeError:
                continue

    if not compression_data:
        print("No compression data found in logs.")
        return

    df = pd.DataFrame(compression_data)
    excel_file = 'compression_analysis.xlsx'

    # Create charts before writing Excel
    chart1 = 'temp_chart1.png'
    chart2 = 'temp_chart2.png'

    plt.figure(figsize=(10, 6))
    df.boxplot(column='compression_ratio', by='algorithm')
    plt.title('Compression Ratio by Algorithm')
    plt.suptitle('')
    plt.savefig(chart1)
    plt.close()

    plt.figure(figsize=(10, 6))
    for algo in df['algorithm'].unique():
        algo_data = df[df['algorithm'] == algo]
        plt.plot(algo_data['timestamp'], algo_data['savings_percentage'], marker='o', label=algo)
    plt.title('Compression Savings Over Time')
    plt.xlabel('Timestamp')
    plt.ylabel('Savings Percentage')
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(chart2)
    plt.close()

    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Raw Data', index=False)

        summary = df.groupby('algorithm').agg({
            'original_size': ['count', 'mean', 'min', 'max'],
            'compressed_size': ['mean', 'min', 'max'],
            'compression_ratio': ['mean', 'min', 'max'],
            'savings_percentage': ['mean', 'min', 'max']
        }).round(2)
        summary.to_excel(writer, sheet_name='Summary Statistics')

        workbook = writer.book
        raw_data_sheet = writer.sheets['Raw Data']
        summary_sheet = writer.sheets['Summary Statistics']

        img1 = Image(chart1)
        img2 = Image(chart2)
        raw_data_sheet.add_image(img1, 'H2')
        raw_data_sheet.add_image(img2, 'H30')

        for sheet in [raw_data_sheet, summary_sheet]:
            for i, col in enumerate(sheet.columns, 1):
                max_length = 0
                for cell in col:
                    if cell.value:
                        try:
                            max_length = max(max_length, len(str(cell.value)))
                        except:
                            pass
                adjusted_width = max_length + 2
                sheet.column_dimensions[get_column_letter(i)].width = adjusted_width

    # Only remove charts after Excel file is successfully saved
    if os.path.exists(chart1):
        os.remove(chart1)
    if os.path.exists(chart2):
        os.remove(chart2)

    print(f"Analysis complete. Results saved to {excel_file}")

if __name__ == "__main__":
    analyze_compression_logs()
