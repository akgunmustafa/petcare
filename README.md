# PetCare Connect

Bu proje, **Türk Hava Kurumu Üniversitesi Bilgisayar Mühendisliği** bölümündeki **Human-Computer Interaction (HCI)** dersi için hazırlanmıştır.

PetCare, evcil hayvan sahipleri için veteriner, pet taksi, otel ve bakıcı, dayanışma ilanları ve dijital aşı karnesini tek ekranda toplayan bir web uygulamasıdır. Arayüz, dersteki kullanılabilirlik hedeflerine göre tasarlanmıştır: acil durumda tek tık, beş net modül ve ilk bakışta öğrenilebilir bir düzen.

## Class Activity for Human-Computer Interaction (HCI): Usability Goals

### Activity: Designing the Ideal User Experience

**Objective:**
The aim is to help students understand usability goals and experience applying them in a hands-on manner.

### Steps

**1. Introduction**

The instructor explains the definition of usability goals and the main objectives:

- **Effectiveness:** How accurately and completely tasks can be performed.
- **Efficiency:** How much effort and time a user needs to complete a given task.
- **Satisfaction:** The degree to which users are pleased with the experience.
- **Learnability:** How easy it is to learn to use the system for the first time.
- **Memorability:** How easy it is to remember how to use the system after not using it for a while.

**2. Group Formation and Task Definition**

Students are divided into groups of 3-4. Each group is asked to redesign the user interface of an everyday object (e.g., a pen, water bottle, coffee machine). The goal is to propose a new design that improves the usability of the chosen object.

**3. Designing and Applying Usability Goals**

Each group follows these steps to make the selected object easier to use:

- Discuss the strengths and weaknesses of the current usage of the object.
- Develop a new design proposal. Draw their designs on paper and explain how they considered each usability goal (e.g., how the new design is more efficient, effective, learnable, etc.).

**4. Presentation and Feedback**

Each group presents their designs and explains how they applied the usability goals to the class. Other students and the instructor provide feedback on the proposed designs, and alternative solutions are discussed.

**5. Evaluation and Discussion**

At the end of the activity, the instructor summarizes how usability goals should be considered in real-world applications and encourages students to discuss what they have learned.

### Expected Outcomes

- Students will have the opportunity to evaluate and improve usability goals through concrete examples.
- Creativity and problem-solving skills will be developed by thinking about ways to enhance user experience.
- The activity will encourage communication and collaboration skills through group work.

This activity ensures active class participation and helps reinforce theoretical knowledge through practical application.

## Bu projede kullanılabilirlik hedefleri

| Hedef | PetCare’de karşılığı |
| --- | --- |
| Effectiveness | Acil butonu nöbetçi kliniği ve pet ambulansı tek işlemde tetikler. Konaklamada “Pet Taksi ekle” kutusu transferi de oluşturur. |
| Efficiency | Acil yardım üst barda, tek tık. Beş sekme: Otel ve Bakıcı, Veterinere Sor, Pet Taksi, İhtiyaç ve İlan, Dijital Karne. |
| Satisfaction | Doğrulanmış veteriner ve bakıcı rozetleri, aşı karnesi ve güvenli havuz (escrow) bildirimi. |
| Learnability | Sade etiketler, büyük birincil butonlar, her modülde tek ana iş. |
| Memorability | Sabit üst bar ve aynı beş sekme; aradan sonra da aynı yerden devam edilir. |

## Çalıştırma

```bash
cd backend && uvicorn main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

Web: http://localhost:3000 · API: http://localhost:8000/docs

Gereksinim analizi: `Requirement Analysis for Pet Care Web Application.txt`
