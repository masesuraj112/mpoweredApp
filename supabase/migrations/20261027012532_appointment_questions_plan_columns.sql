-- Rollback:
--   alter table public.appointment_questions
--     drop constraint uq_aq_appointment_group_order,
--     drop constraint chk_aq_answer_needs_selection,
--     drop constraint chk_aq_answer_length,
--     drop constraint chk_aq_answer_not_blank,
--     drop constraint chk_aq_question_not_blank,
--     drop constraint chk_aq_group_key,
--     drop column is_selected,
--     drop column sort_order,
--     drop column group_key;

-- Every suggested question is stored against the appointment when it is generated. The ones the
-- person ticks have is_selected = true and can hold the doctor's answer.
alter table public.appointment_questions
  add column group_key text not null default 'other',
  add column sort_order smallint not null default 0,
  add column is_selected boolean not null default true;

-- The defaults only fill rows that predate these columns; the save functions always set them.
alter table public.appointment_questions
  alter column group_key drop default,
  alter column sort_order drop default,
  alter column is_selected drop default;

-- Give any existing rows a distinct order and clean blanks before the constraints are added.
update public.appointment_questions q
   set sort_order = s.rn
  from (
    select question_id,
           (row_number() over (partition by appointment_id order by question_id))::smallint as rn
      from public.appointment_questions
  ) s
 where q.question_id = s.question_id;
update public.appointment_questions set answer = null
 where answer is not null and btrim(answer) = '';

alter table public.appointment_questions
  add constraint chk_aq_group_key check (group_key ~ '^[a-z]+(-[a-z]+)*$'),
  add constraint chk_aq_question_not_blank check (length(btrim(question)) > 0),
  add constraint chk_aq_answer_not_blank check (answer is null or length(btrim(answer)) > 0),
  add constraint chk_aq_answer_length check (answer is null or char_length(answer) <= 4000),
  add constraint chk_aq_answer_needs_selection check (answer is null or is_selected),
  add constraint uq_aq_appointment_group_order unique (appointment_id, group_key, sort_order);
