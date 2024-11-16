from fastapi import FastAPI

### Create FastAPI instance with custom docs
app = FastAPI(docs_url="/api/py/docs")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}