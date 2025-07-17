# geospatial/zone_detect_violation/detector_violation.py

import sys
import os
import pandas as pd

# Add root path to import geospatial
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from geospatial.geofencing.fence_utils import load_zone_shapefiles, assign_zone

def detect_illegal_behavior(df, 
                            lon_col="longitude", 
                            lat_col="latitude", 
                            behavior_col="behavior"):
    """
    Assigns zones (MPA, EEZ, Ports) to each vessel point and detects illegal fishing.

    Parameters:
        df (pd.DataFrame): DataFrame with at least longitude, latitude, and behavior columns.
        lon_col (str): Name of the longitude column.
        lat_col (str): Name of the latitude column.
        behavior_col (str): Name of the column containing behavior (e.g., 'fishing', 'non-fishing').

    Returns:
        pd.DataFrame: Same DataFrame with new columns:
                      - in_mpa (bool)
                      - in_eez (bool)
                      - near_port (bool)
                      - illegal_fishing (bool)
    """

    zones = load_zone_shapefiles()

    df = assign_zone(df, zones['mpa'], 'in_mpa', lon_col=lon_col, lat_col=lat_col)
    df = assign_zone(df, zones['eez'], 'in_eez', lon_col=lon_col, lat_col=lat_col)
    df = assign_zone(df, zones['ports'], 'near_port', lon_col=lon_col, lat_col=lat_col)

    # Detect illegal fishing: fishing inside MPA
    df['illegal_fishing'] = (df['in_mpa']) & (df[behavior_col] == 'fishing')

    return df
