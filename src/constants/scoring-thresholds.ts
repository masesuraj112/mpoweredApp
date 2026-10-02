export const ScoreThresholds = {
    pain : {
        0: 'I have no pain at all',
        1: 'The pain is very mild',
        2: 'The pain is very mild',
        3: 'The pain is very mild',
        4: 'The pain is moderate',
        5: 'The pain is moderate',
        6: 'The pain is moderate',
        7: 'The pain is fairly severe',
        8: 'The pain is fairly severe',
        9: 'The pain is extremely severe',
        10: 'The pain is the worst imaginable'
    },
    // Figma only specifies the description for a score of 0.
    mood: {
        0: 'Pain does not impact my mood at all',
        1: 'Pain slightly affects my mood',
        2: 'Pain slightly affects my mood',
        3: 'Pain slightly affects my mood',
        4: 'Pain moderately affects my mood',
        5: 'Pain moderately affects my mood',
        6: 'Pain moderately affects my mood',
        7: 'Pain substantially affects my mood',
        8: 'Pain substantially affects my mood',
        9: 'Pain extremely affects my mood',
        10: 'Pain completely impacts my mood'
    },
     relationships: {
        0: 'Pain does not interfere my relationships with others',
        1: 'Pain slightly interferes my relationships with others',
        2: 'Pain slightly interferes my relationships with others',
        3: 'Pain slightly interferes my relationships with others',
        4: 'Pain moderately interferes my relationships with others',
        5: 'Pain moderately interferes my relationships with others',
        6: 'Pain moderately interferes my relationships with others',
        7: 'Pain substantially interferes my relationships with others',
        8: 'Pain substantially interferes my relationships with others',
        9: 'Pain extremely interferes my relation with others',
        10: 'Pain completely interferes with my relationships with others'
    },
    enjoyment: {
        0: 'Pain does not impact my ability to enjoy life',
        1: 'Pain slightly impacts my ability to enjoy life',
        2: 'Pain slightly impacts my ability to enjoy life',
        3: 'Pain slightly impacts my ability to enjoy life',
        4: 'Pain moderately impacts my ability to enjoy life',
        5: 'Pain moderately impacts my ability to enjoy life',
        6: 'Pain moderately impacts my ability to enjoy life',
        7: 'Pain substantially impacts my ability to enjoy life',
        8: 'Pain substantially impacts my ability to enjoy life',
        9: 'Pain extremely impacts my ability to enjoy life',
        10: 'Pain completely prevents me from enjoying life'
    },
} as const;