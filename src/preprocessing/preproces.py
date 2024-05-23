import os
import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer

# # NLTK kaynaklarını indir
# nltk.download('punkt')
# nltk.download('stopwords')

# Paths to the directories
text_dir = '/Users/mali/Desktop/Krapivin2009/docsutf8'
keyphrases_dir = '/Users/mali/Desktop/Krapivin2009/keys'

def load_abstracts_and_titles(directory):
    data = {}
    for filename in os.listdir(directory):
        if filename.endswith('.txt'):
            file_path = os.path.join(directory, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                # Extracting the abstract between "--A" and "--B"
                start_abstract = content.find('--A')
                end_abstract = content.find('--B', start_abstract)
                # Extracting the title between "--T" and "--A"
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
    stop_words = set(stopwords.words('english'))
    stemmer = PorterStemmer()
    tokens = word_tokenize(text)
    tokens = [word.lower() for word in tokens if word.isalnum()]
    tokens = [word for word in tokens if word not in stop_words]
    tokens = [stemmer.stem(word) for word in tokens]
    return ' '.join(tokens)

data = load_abstracts_and_titles(text_dir)
keyphrases = load_keyphrases(keyphrases_dir)

def save_data(data, keyphrases, output_path):
    output_data = {}
    for filename, content in data.items():
        if filename in keyphrases:
            output_data[filename] = {
                'abstract': preprocess_text(content['abstract']),
                'title': content['title'],
                'keyphrases': keyphrases[filename]
            }
    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(output_data, file, indent=4)

output_path = '/Users/mali/Desktop/processed_data2.json'
save_data(data, keyphrases, output_path)
