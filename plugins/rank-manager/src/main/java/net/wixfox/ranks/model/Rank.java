package net.wixfox.ranks.model;

import java.util.List;

public class Rank {

    private final int id;
    private final String name;
    private final String displayName;
    private final String prefix;
    private final int weight;
    private final boolean isStaff;
    private final List<String> permissions;

    public Rank(int id, String name, String displayName, String prefix, int weight, boolean isStaff, List<String> permissions) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.prefix = prefix;
        this.weight = weight;
        this.isStaff = isStaff;
        this.permissions = permissions;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public String getDisplayName() { return displayName; }
    public String getPrefix() { return prefix; }
    public int getWeight() { return weight; }
    public boolean isStaff() { return isStaff; }
    public List<String> getPermissions() { return permissions; }
}
