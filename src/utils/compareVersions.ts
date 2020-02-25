export function compareVersions(last: string, current: string): -1 | 0 | 1 {
    const longest: 0 | 1 = last.length < current.length ? 1 : 0;
    const versions: number[][] = [
        last, current
    ].map(version => version.split(".")).map(version => version.map(digit => parseInt(digit)));

    for (let i = 0; i < versions[longest].length; i++) {
        if (versions[(longest + 1) % 2][i] === undefined) {
            // one has at least one digit on the other: choose the longer one
            return longest === 1 ? 1 : -1;
        } else {
            if (versions[0][i] < versions[1][i]) {
                // current is more recent
                return 1;
            } else if (versions[0][i] > versions[1][i]) {
                // last is more recent
                return -1;
            }
            // otherwise they match for this iteration
        }
    }
    // they matched for all iterations: they're identical
    return 0;
}