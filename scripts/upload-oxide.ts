import fetch from 'node-fetch';
import * as yaml from 'yaml';
import * as fs from 'fs';

type GitHubSource = {
    type: 'GITHUB';
    properties: {
        owner: string;
        repo: string;
    };
};

type InternalSource = {
    type: 'INTERNAL';
    properties: {
        id: string;
    };
};

type Source = InternalSource | GitHubSource;

// ---

type TokenResponse = {
    token: string;
    source_metadata: Source; // targets the GitHub repository.
}
const getSourceMetadataForApp = async (token, appId) => {
    const editorBasePath = `https://build.journeyapps.com/api/v4/apps/${appId}`;
    const response = await fetch(`${editorBasePath}/files/issue_jwt`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const tokenResponse: TokenResponse = await response.json();
    return tokenResponse
};

// ---
type Author = {
    name: string;
    email: string;
}

type FileModified = {
    type: "modified";
    path: string;
    content: string; // base64 encoded
}

type FileDeleted = {
    type: "deleted";
    path: string;
}

type Delta = FileModified | FileDeleted;

type LatestCommitResponse = {
    data: {
        oid: string; // the commit ID
        author: Author;
        committer: Author;
        timestamp: string;
        message: string;
    }
}


type SingleCommit = {
    oid: string;
    author: Author;
    committer: Author;
    timestamp: string;
    message: string;
};

type CommitPayload = {
    author: {
        email: string;
        name: string;
    };
    delta: Delta[]; // an array of operations
    message: string; // commit message
    branch: string; // the branch to commit against
    ref: string; // a committish the delta is operating on
    source: Source;
}

export type V2CommitResponseClean = {
    success: true;
    commit: SingleCommit;
};

export type V2CommitResponseDirty = {
    success: false;
    conflicts: string[];
};

export type V2CommitResponse = V2CommitResponseClean | V2CommitResponseDirty;


const commitFilesToHEAD = async (token: string, payload: Omit<CommitPayload, 'ref'>) => {
    const { source, branch, delta, message, author } = payload;
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const get_latest_commit_res = await fetch("https://source.journeyapps.com/api/v1/sources/get-latest-commit",
        {
            headers,
            method: "POST",
            body: JSON.stringify({
                source: source,
                branch: branch
            })
        });

    const latest_commit_oid = (await get_latest_commit_res.json() as LatestCommitResponse).data.oid; // Or something like this.

    console.log(`Committing to branch '${branch}'.`);

    const commitPayload: CommitPayload = {
        source: source,
        branch: branch, // Branch to which to commit.
        ref: latest_commit_oid, // The commit we're basing off.
        delta: delta,
        message: message,
        author: author
    };

    const commit_res = await fetch("https://source.journeyapps.com/api/v2/sources/commit", {
        headers: headers,
        method: "POST",
        body: JSON.stringify(commitPayload)
    });

    if (commit_res.ok) {
        const data = (await commit_res.json()).data as V2CommitResponse;

        if (data.success === true) {
            console.log(data.commit)
        } else {
            console.error('Conflict:');
            console.error(data.conflicts);
        }
        return data;
    } else {
        throw `Commit error response: ${commit_res.status} ${commit_res.statusText}.`;
    }
};


const assembleBundle = (outputFileName) => {
    const fileData = fs.readFileSync('dist/' + outputFileName);

    const delta: Delta[] = [
        {
            type: "modified",
            path: `mobile/html/${outputFileName}`,
            content: fileData.toString("base64")
        }
    ];
    return delta;
};


async function main() {
    const config = yaml.parse(fs.readFileSync('config.yml', 'utf8'));

    const { appId, outputFileName, branch, gitName, gitEmail } = config;

    if (!(gitEmail || gitName)) {
        console.error('Missing your Name and Email for git commits');
        throw('Missing git author configuration');
    }

    const editorToken = config.token;

    const { source_metadata, token } = await getSourceMetadataForApp(editorToken, appId);

    const delta = assembleBundle(outputFileName);

    const result = await commitFilesToHEAD(token,  {
        source: source_metadata,
        author: {
            name: gitName,
            email: gitEmail
        },
        branch: branch ? branch : 'master',
        message: 'Updating HTML-Bridge component.',
        delta: delta
    });
}

main().catch(e => console.error(e));