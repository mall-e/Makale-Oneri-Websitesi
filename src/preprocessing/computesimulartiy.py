import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from preprocessing.getinterests import get_interest_vector, get_user_interests

# Makale vektörlerini ve kullanıcı vektörünü alarak öneri yapacak fonksiyon
def recommend_articles(user_vector, article_vectors):
    similarities = {}
    for article_id, article_vector in article_vectors.items():
        # Kullanıcı vektörü ile makale vektörleri arasında kosinüs benzerliği hesapla
        sim = cosine_similarity(user_vector.reshape(1, -1), article_vector.reshape(1, -1))
        similarities[article_id] = sim[0][0]
    # En yüksek benzerlik puanına sahip makaleleri sırala
    recommended_articles = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:5]
    return recommended_articles

# Kullanıcı ilgi alanlarından vektör temsili elde et
user_interests = get_user_interests("WPAEXx7knqNveXCo4kXfGX1HSrp2")
user_vector = get_interest_vector(user_interests)

# Önceden oluşturulan makale vektörleri ile önerileri al
recommended = recommend_articles(user_vector, scibert_embeddings)
print("Önerilen Makaleler:")
for article, similarity in recommended:
    print(f"Makale ID: {article}, Benzerlik: {similarity}")
