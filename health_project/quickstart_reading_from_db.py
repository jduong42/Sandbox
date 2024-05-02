from pymongo import MongoClient
import certifi

uri = 'mongodb+srv://healthuser:Zsw2eSloBajEW2Gf@healthcluster1.o0urzkd.mongodb.net/?retryWrites=true&w=majority&appName=healthcluster1'
client = MongoClient(uri, tlsCAFile=certifi.where())


# Query for a movie that has the title 'Back to the Future'

"""
try:
    database = client.get_database("sample_mflix")
    movies = database.get_collection("movies")

    
    query = { "title": "Back to the Future" }
    movie = movies.find_one(query)
    print(movie)
    client.close()
"""

# Query for movies that have a runtime more than 90 minutes.

"""
try:
    database = client.get_database("sample_mflix")
    movies = database.get_collection("movies")

    results = movies.find({"runtime": {"$gt": 90}})
    print(results[0])
    client.close()
"""

# Query to retrieve distinct values of movie titles.

"""
try:

    database = client.get_database("sample_mflix")
    movies = database.get_collection("movies")

    different_titles = movies.distinct("title")

    for title in different_titles:
        print(title)
    client.close()
"""

# Query to retrieve the count of all movies in the document.

"""
try:

    database = client.get_database("sample_mflix")
    movies = database.get_collection("movies")

    count = movies.count_documents({})
    print(count)
    client.close()
"""

# Query to retrieve all movies that belongs into genre 'Action'.

try:

    db = client.get_database("sample_mflix")
    movies = db.get_collection("movies")

    results = movies.count_documents({"genres": "Action"})
    print(results)
    client.close()

except Exception as e:
    raise Exception("Unable to find the document due to the following error: ", e)
