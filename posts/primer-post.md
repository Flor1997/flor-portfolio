# ¡Hola, mundo de datos!

Este es mi primer post. Acá voy a ir dejando mis estudios y proyectos.  
**Stack:** SQL (BigQuery), Python (pandas, scikit-learn), métricas de producto y riesgo crediticio.

```sql
-- snippet de ejemplo (BigQuery)
SELECT user_id, score, month
FROM `proyecto.dataset.tabla`
QUALIFY ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY month DESC) = 1;
