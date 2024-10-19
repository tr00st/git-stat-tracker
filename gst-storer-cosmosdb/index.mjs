import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
const credential = new DefaultAzureCredential();
const client = new CosmosClient({
    endpoint: 'https://stat-trackering.documents.azure.com:443/',
    aadCredentials: credential,
    connectionPolicy: {
        connectionMode: ""
    }
});
const database = client.database("tr00st-repo-stats");
const container = database.container("main-stats");
const repoUri = "https://github.com/tr00st/git-stat-tracker/";
const metrics = {
    totalLintErrors: Math.floor(Math.random()*100),
    totalLintWarnings: Math.floor(Math.random()*100)
};
const commitHash = `DummyId-${Math.random()}${Math.random()}`;
const timingStart = Date.now();
const item = {
    id: commitHash, // Commit hash
    commitTimestamp: new Date(),
    repository: repoUri,
    ...metrics
};
const newItem = await container.items.upsert(item, {});
const timingEnd = Date.now();
console.log(`Initial upsert took ${timingEnd - timingStart}ms`)
const retrievedItem = await container.item(commitHash, repoUri);
