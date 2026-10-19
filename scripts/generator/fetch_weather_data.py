#!/usr/bin/env python3
"""
Skrypt zasilający (seeder).
Pobiera rzeczywiste dane meteorologiczne z Open-Meteo (temperatury w południe z ostatnich 30 dni)
dla 3 miast: Warszawy, Londynu oraz Nowego Jorku, a następnie tworzy 3 serie pomiarowe,
rejestruje dla nich czujniki i wysyła pomiary do aplikacji przez REST API.
"""

import argparse
import sys
import time
import requests

CITIES = [
    {
        "city": "Warszawa",
        "lat": 52.2297,
        "lon": 21.0122,
        "color": "#E74C3C",  # Czerwony
        "series_name": "Temperatura - Warszawa (Open-Meteo)",
        "sensor_name": "Stacja Meteo - Warszawa"
    },
    {
        "city": "Londyn",
        "lat": 51.5074,
        "lon": -0.1278,
        "color": "#3498DB",  # Niebieski
        "series_name": "Temperatura - Londyn (Open-Meteo)",
        "sensor_name": "Stacja Meteo - Londyn"
    },
    {
        "city": "Nowy Jork",
        "lat": 40.7128,
        "lon": -74.0060,
        "color": "#2ECC71",  # Zielony
        "series_name": "Temperatura - Nowy Jork (Open-Meteo)",
        "sensor_name": "Stacja Meteo - Nowy Jork"
    }
]

def parse_arguments():
    """Parsuje argumenty wiersza poleceń."""
    parser = argparse.ArgumentParser(
        description=(
            "Skrypt integracyjny z API: logowanie, tworzenie serii, czujników i"
            " wysyłanie danych z Open-Meteo."
        )
    )
    parser.add_argument("url", type=str, help="Adres URL do Twojej usługi (np. http://localhost:8080/api)")
    parser.add_argument("username", type=str, help="Nazwa użytkownika (login)")
    parser.add_argument("password", type=str, help="Hasło użytkownika")
    return parser.parse_args()

def fetch_weather_for_city(city_info):
    """
    Pobiera temperatury godzinowe z ostatnich 30 dni z Open-Meteo
    i wybiera odczyty z godziny 12:00 (południe) z każdego dnia.
    """
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={city_info['lat']}&longitude={city_info['lon']}"
        "&past_days=30&forecast_days=0&hourly=temperature_2m"
    )
    print(f"Pobieranie danych pogodowych dla: {city_info['city']}...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        times = data.get("hourly", {}).get("time", [])
        temps = data.get("hourly", {}).get("temperature_2m", [])

        noon_measurements = []
        for t, temp in zip(times, temps):
            # Wybieramy odczyt z godziny 12:00 każdego dnia (np. '2026-09-18T12:00')
            if t.endswith("T12:00") and temp is not None:
                # Formatowanie do pełnego ISO-8601 ze strefą Z (UTC)
                iso_timestamp = f"{t}:00Z"
                noon_measurements.append({
                    "timestamp": iso_timestamp,
                    "value": float(temp)
                })

        print(f" -> Pobrano {len(noon_measurements)} dziennych pomiarów dla {city_info['city']}.")
        return noon_measurements

    except requests.exceptions.RequestException as e:
        print(f" Błąd podczas pobierania danych z Open-Meteo dla {city_info['city']}: {e}")
        return []

def main():
    args = parse_arguments()

    # Bezpieczne zapewnienie prefiksu /api
    base_url = args.url.rstrip("/")
    service_url = base_url if base_url.endswith("/api") else f"{base_url}/api"

    session = requests.Session()

    # 1. Logowanie administratora
    print(f"\n1. Logowanie do usługi ({service_url}) jako '{args.username}'...")
    login_payload = {"username": args.username, "password": args.password}

    try:
        response = session.post(f"{service_url}/auth/login", json=login_payload, timeout=10)
    except requests.exceptions.RequestException as e:
        print(f"Błąd połączenia z serwerem: {e}")
        sys.exit(1)

    if response.status_code != 200:
        print(f"Błąd logowania ({response.status_code}): {response.text}")
        sys.exit(1)

    bearer_token = response.json().get("accessToken")
    if not bearer_token:
        print("Błąd: Nie znaleziono pola 'accessToken' w odpowiedzi z serwera.")
        sys.exit(1)

    print(" -> Zalogowano pomyślnie. Pobrano token JWT.")

    headers_admin = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json",
    }

    # 2. Tworzenie serii, czujników i zasilanie danymi dla każdego miasta
    print("\n2. Rozpoczynam tworzenie serii, czujników i pobieranie danych...\n")

    total_series_created = 0

    for city_info in CITIES:
        # A. Pobranie danych pogodowych
        measurements = fetch_weather_for_city(city_info)
        if not measurements:
            print(f" Pomijam {city_info['city']} ze względu na brak danych.\n")
            continue

        # B. Tworzenie Serii Pomiarowej (POST /api/series)
        series_payload = {
            "name": city_info["series_name"],
            "minValue": -50.0,
            "maxValue": 60.0,
            "color": city_info["color"],
            "unit": "°C"
        }

        res_series = session.post(f"{service_url}/series", json=series_payload, headers=headers_admin, timeout=10)
        if res_series.status_code not in [200, 201]:
            print(f" Błąd tworzenia serii dla {city_info['city']} ({res_series.status_code}): {res_series.text}\n")
            continue

        series_data = res_series.json()
        series_id = series_data.get("id")
        print(f" Utworzono serię: '{city_info['series_name']}' (ID: {series_id})")

        # C. Rejestracja Czujnika dla serii (POST /api/sensors)
        sensor_payload = {
            "seriesId": series_id,
            "name": city_info["sensor_name"]
        }

        res_sensor = session.post(f"{service_url}/sensors", json=sensor_payload, headers=headers_admin, timeout=10)
        if res_sensor.status_code not in [200, 201]:
            print(f" Błąd tworzenia czujnika dla {city_info['city']} ({res_sensor.status_code}): {res_sensor.text}\n")
            continue

        sensor_data = res_sensor.json()
        api_key = sensor_data.get("apiKey")
        sensor_id = sensor_data.get("id")
        print(f" -> Zarejestrowano czujnik: '{city_info['sensor_name']}' (ID: {sensor_id})")

        # D. Wysyłanie pomiarów czujnika (POST /api/measurements) z kluczem X-API-Key
        headers_sensor = {
            "X-API-Key": api_key,
            "Content-Type": "application/json",
        }

        sent_count = 0
        for m in measurements:
            m_payload = {
                "value": m["value"],
                "timestamp": m["timestamp"]
            }

            res_m = session.post(f"{service_url}/measurements", json=m_payload, headers=headers_sensor, timeout=10)
            if res_m.status_code in [200, 201]:
                sent_count += 1
            else:
                print(f"    [!] Błąd dodawania pomiaru ({res_m.status_code}): {res_m.text}")

        print(f" -> Pomyślnie wysłano {sent_count}/{len(measurements)} pomiarów.\n")
        total_series_created += 1
        time.sleep(0.2)

    print("=========================================================")
    if total_series_created >= 3:
        print(f" SUKCES: Utworzono {total_series_created} serie z danymi z Open-Meteo!")
        print(" Wymaganie F11 (minimum 3 serie po minimum 15 wyników) zostało spełnione.")
    else:
        print(f"[!] UWAGA: Utworzono tylko {total_series_created} serie. Sprawdź komunikaty powyżej.")
    print("=========================================================\n")

if __name__ == "__main__":
    main()
