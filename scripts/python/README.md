Чтобы запустить проект в ларавел:
php artisan serve 
npm run dev

А python-скрипты чтобы работали, надо запустить venv

+++++++++++++++++++++++++

// TODO: автоматизировать обязательно
/**
* После fetch_arxiv.py и актуализации arxiv_dataset.json
* Раскоментировать сначала ArticleSeeder и заполнить базу
* После выкачить articles_export.json ручками из mongoDb содержимое
* Передать их в build_normalized_articles.py , там получить
* normalized_articles.json и передать уже их в build_synonyms.py и получить
* query_synonyms.json.
* И потом и query_synonyms.json, и normalized_articles.json переместить в
* storage app и уже только после этого раскоментировать NormalizedArticleSeeder
* и заполнить базу вторую
*  normalize_query.py - используется для преобразования поискового запроса 
* пользователя
*/
