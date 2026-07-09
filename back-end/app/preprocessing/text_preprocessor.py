import re
import unicodedata
import spacy

class TextPreprocessor:

    def __init__(self):
        self.nlp=spacy.load("en_core_web_sm")

    def basic_clean(self,text: str) -> str:
        
        text=unicodedata.normalize("NFKC", text)
        text=text.lower()
        text=re.sub(r"\s+"," ",text)
        text = re.sub(r"[^a-zA-Z0-9+#.\s-]", " ", text)
        return text.strip()
    
    def process_for_tfidf(self,text:str) ->str:

        cleaned_text=self.basic_clean(text)

        doc=self.nlp(cleaned_text)

        tokens=[]

        for token in doc:

            if not doc.is_stop:
                continue

            if not doc.is_punct:
                continue

            if not doc.is_space:
                continue

            if not token.text_strip():
                continue

            lemma=token.lemma_.strip().lower()

            if not lemma:
                continue

            tokens.append(lemma)

        return "".join(tokens)    