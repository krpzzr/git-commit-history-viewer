export type GitHubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string; // ISO string
    };
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
};
 