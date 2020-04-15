"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = createPullRequest;
function createPullRequest(octokit, { owner, repo, title, body, base, head, changes }) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield octokit.request("GET /repos/:owner/:repo", {
            owner,
            repo,
        });
        if (!response.data.permissions) {
            throw new Error("[octokit-create-pull-request] Missing authentication");
        }
        if (!base) {
            base = response.data.default_branch;
        }
        let fork = owner;
        if (!response.data.permissions.push) {
            const user = yield octokit.request("GET /user");
            const forks = yield octokit.request("GET /repos/:owner/:repo/forks", {
                owner,
                repo,
            });
            const hasFork = forks.data.find((fork) => fork.owner.login === user.data.login);
            if (!hasFork) {
                yield octokit.request("POST /repos/:owner/:repo/forks", {
                    owner,
                    repo,
                });
            }
            fork = user.data.login;
        }
        response = yield octokit.request("GET /repos/:owner/:repo/commits", {
            owner,
            repo,
            sha: base,
            per_page: 1,
        });
        let latestCommitSha = response.data[0].sha;
        const treeSha = response.data[0].commit.tree.sha;
        const tree = (yield Promise.all(Object.keys(changes.files).map((path) => __awaiter(this, void 0, void 0, function* () {
            if (changes.files[path] === null) {
                // Deleting a non-existent file from a tree leads to an "GitRPC::BadObjectState" error
                try {
                    const response = yield octokit.request("HEAD /repos/:owner/:repo/contents/:path", {
                        owner: fork,
                        repo,
                        ref: latestCommitSha,
                        path,
                    });
                    return {
                        path,
                        mode: "100644",
                        sha: null,
                    };
                }
                catch (error) {
                    return;
                }
            }
            return {
                path,
                mode: "100644",
                content: changes.files[path],
            };
        })))).filter(Boolean);
        response = yield octokit.request("POST /repos/:owner/:repo/git/trees", {
            owner: fork,
            repo,
            base_tree: treeSha,
            tree,
        });
        const newTreeSha = response.data.sha;
        response = yield octokit.request("POST /repos/:owner/:repo/git/commits", {
            owner: fork,
            repo,
            message: changes.commit,
            tree: newTreeSha,
            parents: [latestCommitSha],
        });
        latestCommitSha = response.data.sha;
        yield octokit.request("POST /repos/:owner/:repo/git/refs", {
            owner: fork,
            repo,
            sha: latestCommitSha,
            ref: `refs/heads/${head}`,
        });
        return yield octokit.request("POST /repos/:owner/:repo/pulls", {
            owner,
            repo,
            head: `${fork}:${head}`,
            base,
            title,
            body,
        });
    });
}
