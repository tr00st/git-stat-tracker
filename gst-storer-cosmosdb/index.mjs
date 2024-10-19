import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();

const client = new CosmosClient({
    endpoint: 'https://stat-trackering.documents.azure.com:443/',
    aadCredentials: credential
});

const database = client.database("tr00st-repo-stats");

const container = database.container("main-stats");

const repoUri = "https://github.com/tr00st/git-stat-tracker/";

const newItem = container.items.upsert({
    CommitId: "abc123",
    CommitTimestamp: new Date(),
    Repository: repoUri
});

const retrievedItem = await container.item("abc123", repoUri);
console.log(retrievedItem)
