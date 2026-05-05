package com.rideapp.routing;

import org.springframework.util.Assert;

public class DataSourceContextHolder {

    private static final ThreadLocal<DataSourceType> contextHolder = new ThreadLocal<>();

    public static void setDataSourceType(DataSourceType dataSourceType) {
        Assert.notNull(dataSourceType, "DataSourceType cannot be null");
        contextHolder.set(dataSourceType);
    }

    public static DataSourceType getDataSourceType() {
        return contextHolder.get();
    }

    public static void clearDataSourceType() {
        contextHolder.remove();
    }
}
