import os
import json
import nltk
from nltk.stem import SnowballStemmer

# NLTK veri indirme
nltk.download('punkt')
nltk.download('stopwords')
from nltk.corpus import stopwords

# Paths to the directories
text_dir = '/Users/mali/Desktop/Krapivin2009/docsutf8'
keyphrases_dir = '/Users/mali/Desktop/Krapivin2009/keys'

# Initialize stemmer
stemmer = SnowballStemmer('english')
stop_words = set(stopwords.words('english'))

def load_abstracts_and_titles(directory):
    data = {}
    for filename in os.listdir(directory):
        if filename.endswith('.txt'):
            file_path = os.path.join(directory, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                start_abstract = content.find('--A')
                end_abstract = content.find('--B', start_abstract)
                start_title = content.find('--T')
                end_title = start_abstract
                if start_abstract != -1 and end_abstract != -1 and start_title != -1:
                    abstract = content[start_abstract+3:end_abstract].strip()
                    title = content[start_title+3:end_title].strip()
                    data[filename.replace('.txt', '')] = {'abstract': abstract, 'title': title}
    return data

def load_keyphrases(directory):
    keyphrases = {}
    for filename in os.listdir(directory):
        if filename.endswith('.key'):
            file_path = os.path.join(directory, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                keyphrases[filename.replace('.key', '')] = [line.strip() for line in file.readlines()]
    return keyphrases

def preprocess_text(text):
    words = nltk.word_tokenize(text)
    return " ".join([stemmer.stem(word) for word in words if word.isalnum() and word not in stop_words])

data = load_abstracts_and_titles(text_dir)
keyphrases = load_keyphrases(keyphrases_dir)

def preprocess_data(data):
    processed_data = {}
    for filename, content in data.items():
        if filename in keyphrases:
            processed_data[filename] = {
                'abstract': preprocess_text(content['abstract']),
                'title': content['title'],
                'keyphrases': keyphrases[filename]
            }
    return processed_data

# Preprocess for FastText
processed_data = preprocess_data(data)

output_path = '/Users/mali/Desktop/processed_data_fasttext.json'

def save_data(data, output_path):
    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

save_data(processed_data, output_path)
