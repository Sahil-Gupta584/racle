import { env } from "@repo/lib/envs";

export type TBackendRes<T> = {
  ok: boolean;
  error?: string;
  result?: T | null;
};

export const backendRes = <T = undefined>({
  ok,
  error,
  result,
}: TBackendRes<T>): TBackendRes<T> => {
  return {
    ok,
    error,
    result,
  };
};
export const webhook_secret = env.GITHUB_WEBHOOK_SECRET;

export function parseGitHubRepoUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?/);
  if (!match) throw new Error("Invalid GitHub repo URL");

  if (!match || !match[1] || !match[2]) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

export async function getLatestCommitInfo(repoUrl: string) {
  try {
    const parsed = parseGitHubRepoUrl(repoUrl);
    if (!parsed) return null;

    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits`
    );
    console.log({ ok: res.ok });

    if (!res.ok) {
      const errors = await res.json();
      console.log({ errors });
    }

    const commits = await res.json();
    console.log({ commits });
    const latest = commits?.[0];

    return {
      hash: latest?.sha,
      message: latest?.commit?.message,
    };
  } catch (error) {
    console.log("Failed to get commit info", error);
    throw error;
  }
}
