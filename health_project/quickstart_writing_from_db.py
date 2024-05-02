import pymongo
from pymongo import MongoClient
import certifi

uri = 'mongodb+srv://healthuser:Zsw2eSloBajEW2Gf@healthcluster1.o0urzkd.mongodb.net/?retryWrites=true&w=majority&appName=healthcluster1'
client = MongoClient(uri, tlsCAFile=certifi.where())
database = client["health_project_database"]
collection = database["health"]

# Query to insert a single document into the database.

"""
try:
    
    result = collection.insert_one({"id": 2, "name": "Jaakko Paloheimo", "age": 23, "maxHR": 197})
    print(result.acknowledged)

    client.close()
"""

# Query to insert multiple different documents into the database.

"""
try:

    result = collection.insert_many([{"id": 3, "name": "Rabiul Islam", "age": 32, "maxHR": 188},
                                     {"id": 4, "name": "Lauri Kiviperä", "age": 29, "maxHR": 191}])
    print(result.acknowledged)
    client.close()
"""

# Query to update one document in the database.

"""
try:

    query_filter = {"id": 2}
    update_operation = {"$set": {"age": 24}}
    
    result = collection.update_one(query_filter, update_operation)
    print(result.modified_count)
    client.close()
"""

# Query to update multiple documents in the database.

"""
try:

    query_filter = {"maxHR": 198}
    update_operation = {"$set": {"maxHR": 197}}
    
    result = collection.update_many(query_filter, update_operation)
    print(result.modified_count)
    client.close()
"""

# Query to replace one document in the database.

"""
try:

    query_filter = {"id": 4}
    replacement = {"id": 5, "name": "Eerik Vainio", "age": 26, "maxHR": 194}
    
    result = collection.replace_one(query_filter, replacement)
    print(result.modified_count)
    client.close()
"""

# Query to delete one document in the database.

"""
try:

    query_filter = {"id": 1}
    result = collection.delete_one(query_filter)
    print(result.deleted_count)
    client.close()
"""

# Query to delete multiple documents in the database.

"""
try:

    query_filter = {"maxHR": 197}
    result = collection.delete_many(query_filter)
    print(result.deleted_count)
    client.close()
"""

# Query to bulk write multiple operations in the database.

try:

    operations = [pymongo.InsertOne({"id": 6, "name": "Joonas Kallio", "age": 27, "maxHR": 195}),
                  pymongo.InsertOne({"id": 7, "name": "Jukka Lehto", "age": 28, "maxHR": 196}),
                  pymongo.InsertOne({"id": 8, "name": "Jussi Kinnunen", "age": 30, "maxHR": 193}),
    ]

    results = collection.bulk_write(operations)
    print(results)
    client.close()

except Exception as e:
    raise Exception("The following error occured: ", e)