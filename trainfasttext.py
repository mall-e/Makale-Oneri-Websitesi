import os

# Klasör yolunu belirtin
docsutf8_dir = '/Users/mali/Desktop/Krapivin2009/docsutf8'
train_data_path = '/Users/mali/Desktop/train_data.txt'

# Metin dosyasına yazmak için verileri işleyin
with open(train_data_path, 'w', encoding='utf-8') as f:
    for filename in os.listdir(docsutf8_dir):
        if filename.endswith('.txt'):
            file_path = os.path.join(docsutf8_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read().replace('\n', ' ')
                f.write(content + '\n')

import fasttext

# FastText modelini eğitin
model = fasttext.train_unsupervised(input=train_data_path, model='skipgram', dim=300, epoch=10)

# Eğitilmiş modeli kaydedin
model_save_path = '/Users/mali/Desktop/custom_fasttext_model.bin'
model.save_model(model_save_path)

