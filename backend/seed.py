import json

from sqlmodel import Session, select

from models import BoardingListing, CommunityAd, Pet, User, VetQuestion


def seed_if_empty(session: Session) -> None:
    if session.exec(select(User)).first():
        return

    owner = User(
        name="Ayşe Demir",
        phone="+90 532 111 22 33",
        role="owner",
        is_verified=True,
        lat=40.9909,
        lng=29.0303,
    )
    vet_kadikoy = User(
        name="Dr. Elif Kaya",
        phone="+90 216 444 11 22",
        role="vet",
        is_verified=True,
        lat=40.9881,
        lng=29.0244,
        is_open=True,
        clinic_name="Kadıköy 7/24 Veteriner",
    )
    vet_besiktas = User(
        name="Dr. Mert Aydın",
        phone="+90 212 444 33 44",
        role="vet",
        is_verified=True,
        lat=41.0422,
        lng=29.0078,
        is_open=True,
        clinic_name="Beşiktaş Pet Klinik",
    )
    driver = User(
        name="Can Özkan",
        phone="+90 533 555 66 77",
        role="driver",
        is_verified=True,
        lat=40.9860,
        lng=29.0280,
    )
    sitter = User(
        name="Zeynep Arslan",
        phone="+90 534 222 33 44",
        role="sitter",
        is_verified=True,
        lat=41.0214,
        lng=29.0144,
    )
    hotel = User(
        name="Pati Palace",
        phone="+90 216 555 00 11",
        role="hotel_admin",
        is_verified=True,
        lat=40.9812,
        lng=29.0821,
    )
    session.add_all([owner, vet_kadikoy, vet_besiktas, driver, sitter, hotel])
    session.commit()
    for row in (owner, vet_kadikoy, vet_besiktas, driver, sitter, hotel):
        session.refresh(row)

    pamuk = Pet(
        owner_id=owner.id,
        name="Pamuk",
        species="Kedi",
        breed="Tekir",
        weight_kg=4.2,
        vaccines_json=json.dumps(
            [
                {"name": "Karma (FVRCP)", "date": "2026-03-12", "next": "2027-03-12"},
                {"name": "Kuduz", "date": "2026-03-12", "next": "2027-03-12"},
            ],
            ensure_ascii=False,
        ),
        medical_notes="Alerjik dermatit — tahılsız mama.",
    )
    karabas = Pet(
        owner_id=owner.id,
        name="Karabaş",
        species="Köpek",
        breed="Kangal karışık",
        weight_kg=28.0,
        vaccines_json=json.dumps(
            [
                {"name": "Karma (DHPPi)", "date": "2026-01-20", "next": "2027-01-20"},
                {"name": "Kuduz", "date": "2026-01-20", "next": "2027-01-20"},
                {"name": "Kennel cough", "date": "2026-06-02", "next": "2027-06-02"},
            ],
            ensure_ascii=False,
        ),
        medical_notes="Kalça displazisi takipte.",
    )
    session.add_all([pamuk, karabas])
    session.commit()
    session.refresh(pamuk)

    session.add_all(
        [
            VetQuestion(
                pet_id=pamuk.id,
                title="Pamuk 2 gündür mama yemiyor, ne yapmalıyım?",
                vet_answer="İştahsızlık 24 saati aştıysa muayene şart. Su içiyorsa acil değil; kusma/ishal varsa bugün kliniğe gelin.",
                is_resolved=True,
                vet_id=vet_kadikoy.id,
            ),
            VetQuestion(
                pet_id=pamuk.id,
                title="Aşı takvimi gecikti, tekrar baştan mı başlamalıyız?",
                vet_answer=None,
                is_resolved=False,
            ),
        ]
    )

    session.add_all(
        [
            BoardingListing(
                host_id=hotel.id,
                name="Pati Palace Kadıköy",
                type="hotel",
                price_per_night=950,
                features_json=json.dumps(
                    {"no_other_pets": True, "garden": True, "cam_24_7": True}
                ),
                rating=4.8,
                lat=40.9812,
                lng=29.0821,
                neighborhood="Kadıköy",
            ),
            BoardingListing(
                host_id=sitter.id,
                name="Zeynep'in Evi — Üsküdar",
                type="home_sitter",
                price_per_night=450,
                features_json=json.dumps(
                    {"no_other_pets": True, "garden": False, "cam_24_7": False}
                ),
                rating=4.9,
                lat=41.0214,
                lng=29.0144,
                neighborhood="Üsküdar",
            ),
            BoardingListing(
                host_id=sitter.id,
                name="Bahçeli Pati Evi",
                type="home_sitter",
                price_per_night=380,
                features_json=json.dumps(
                    {"no_other_pets": False, "garden": True, "cam_24_7": False}
                ),
                rating=4.4,
                lat=40.9780,
                lng=28.8740,
                neighborhood="Bakırköy",
            ),
        ]
    )

    session.add_all(
        [
            CommunityAd(
                user_id=owner.id,
                category="blood",
                title="Acil A- kan aranıyor (Golden)",
                description="3 yaşında Golden, ameliyat öncesi kan ihtiyacı. Kartal.",
                location="Kartal",
            ),
            CommunityAd(
                user_id=sitter.id,
                category="adoption",
                title="Yavru tekir yuva arıyor",
                description="2 aylık, aşıları başladı. Sadece iç mekân.",
                location="Kadıköy",
            ),
            CommunityAd(
                user_id=hotel.id,
                category="food_support",
                title="Sokak patilerine mama bağışı",
                description="Kuru mama ve konserveye ihtiyacımız var.",
                location="Üsküdar",
            ),
            CommunityAd(
                user_id=owner.id,
                category="lost",
                title="Kayıp: turuncu tekir, ismi Mırmır",
                description="Son görüldüğü yer Moda sahili. Tasma yok.",
                location="Moda",
            ),
        ]
    )
    session.commit()
