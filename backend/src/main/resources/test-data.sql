INSERT INTO users (user_id, username, password) VALUES
(1, 'TestUser1', '$2a$12$VywSbDDag32qiYziXbIWg.T1fXErZUn9Wso5cKVz826pxM7uM7rYe');
INSERT INTO story(story_id, description, title, user_id) VALUES
(1, 'TestDescription', 'TestTitle', 1);
INSERT INTO tag_type(tag_type_id, name, story_id) VALUES
(1, 'TagType1', 1), (2, 'TagType2', 1);
INSERT INTO tag(tag_id, tag_name, tag_type_id, story_id, color) VALUES
(1, 'Tag11', 1, 1, '#D0BBFF'),
(2, 'Tag12', 1, 1, '#B8EAFF');
INSERT INTO plot_event(event_id, content, date, description, event_type, is_in_plot, title, memory_ref_id, next_event_id, prev_event_id, story_id) VALUES
(1, 'TestContent', '1500.01.01', 'TestDescription', 'dated', true, 'TestTitle', null, null, null, 1);
INSERT INTO plot_event_tag(event_id, tag_id) VALUES
(1, 1);