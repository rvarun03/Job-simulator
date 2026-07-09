from sklearn.feature_extraction.text import TfidfVectorizer
from preprocessing.text_preprocessor import TextPreprocessor
from sklearn.metrics.pairwise import cosine_similarity

text_preprocessor = TextPreprocessor()

def calculate_tfidf_cosine_score(jd_text:str, resume_text:str):

    processed_jd=text_preprocessor.process_for_tfidf(jd_text)
    processed_resume=text_preprocessor.process_for_tfidf(resume_text)

    documents=[
        processed_jd,
        processed_resume
    ]

    vectorizer=TfidfVectorizer(
        ngram_range=(1,2)
    )

    tfidf_matrix=vectorizer.fit_transform(documents)

    similarity = cosine_similarity(
        tfidf_matrix[0],
        tfidf_matrix[1]
    )[0][0]

    return round(float(similarity * 100), 2)