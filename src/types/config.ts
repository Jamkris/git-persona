export interface Profile {
  name: string;
  gitUserName: string;
  gitUserEmail: string;
  sshKeyPath: string;
  directories: string[];
}

export interface PersonaConfig {
  version: 1;
  activeProfile: string | null;
  profiles: Profile[];
}
