import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import os

def load_zone_shapefiles():
    """Loads the first .shp file from each zone folder (mpa, eez, ports)."""
    base_path = "geospatial/geofencing/shapefiles/"
    
    def get_shp_path(folder_name):
        folder_path = os.path.join(base_path, folder_name)
        for file in os.listdir(folder_path):
            if file.endswith(".shp"):
                return os.path.join(folder_path, file)
        raise FileNotFoundError(f"No .shp file found in {folder_name}")
    
    return {
        "mpa": gpd.read_file(get_shp_path("mpa_zones")).to_crs(epsg=4326),
        "eez": gpd.read_file(get_shp_path("eez_zones")).to_crs(epsg=4326),
        "ports": gpd.read_file(get_shp_path("ports")).to_crs(epsg=4326),
    }

def assign_zone(df, zone_gdf, column_name, lon_col="LON", lat_col="LAT"):
    """
    Assigns True/False if each point falls within a given zone.

    Parameters:
    - df: Pandas DataFrame with longitude and latitude columns.
    - zone_gdf: GeoDataFrame of the zone (MPA, EEZ, etc.)
    - column_name: Name of the output column indicating zone membership.
    - lon_col: Column name for longitude (default 'LON').
    - lat_col: Column name for latitude (default 'LAT').

    Returns:
    - DataFrame with a new column showing zone inclusion as True/False.
    """
    gdf = df.copy()
    gdf['geometry'] = [Point(xy) for xy in zip(gdf[lon_col], gdf[lat_col])]
    gdf = gpd.GeoDataFrame(gdf, geometry='geometry', crs="EPSG:4326")
    gdf[column_name] = gdf.within(zone_gdf.unary_union)
    return pd.DataFrame(gdf.drop(columns='geometry'))
