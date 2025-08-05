// 'use client';

// import React, { useState } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   Paper,
//   Button,
//   Chip,
//   IconButton,
// } from '@mui/material';
// import {
//   DragIndicator,
//   RestartAlt,
//   ChevronRight,
//   People,
// } from '@mui/icons-material';

// const CausalRankingPage = () => {
//   const [cards, setCards] = useState([
//     {
//       id: 1,
//       text: "Sleep deprivation is associated with hippocampal memory consolidation in young adults",
//       keyWord: "is associated with",
//       originalPosition: 1
//     },
//     {
//       id: 2,
//       text: "Sleep deprivation impairs hippocampal memory consolidation in young adults",
//       keyWord: "impairs",
//       originalPosition: 2
//     },
//     {
//       id: 3,
//       text: "Sleep deprivation influences hippocampal memory consolidation in young adults",
//       keyWord: "influences",
//       originalPosition: 3
//     },
//     {
//       id: 4,
//       text: "Sleep deprivation affects hippocampal memory consolidation in young adults",
//       keyWord: "affects",
//       originalPosition: 4
//     }
//   ]);

//   const [draggedItem, setDraggedItem] = useState(null);
//   const [dragOverIndex, setDragOverIndex] = useState(null);

//   const handleDragStart = (e, index) => {
//     setDraggedItem(index);
//     e.dataTransfer.effectAllowed = 'move';
//   };

//   const handleDragOver = (e, index) => {
//     e.preventDefault();
//     setDragOverIndex(index);
//   };

//   const handleDragLeave = () => {
//     setDragOverIndex(null);
//   };

//   const handleDrop = (e, dropIndex) => {
//     e.preventDefault();
    
//     if (draggedItem === null) return;

//     const newCards = [...cards];
//     const draggedCard = newCards[draggedItem];
    
//     // Remove the dragged item
//     newCards.splice(draggedItem, 1);
    
//     // Insert at new position
//     newCards.splice(dropIndex, 0, draggedCard);
    
//     setCards(newCards);
//     setDraggedItem(null);
//     setDragOverIndex(null);
//   };

//   const handleRestart = () => {
//     const resetCards = [...cards].sort((a, b) => a.originalPosition - b.originalPosition);
//     setCards(resetCards);
//   };

//   const highlightKeyWord = (text, keyWord) => {
//     const parts = text.split(new RegExp(`(${keyWord})`, 'gi'));
//     return parts.map((part, index) => 
//       part.toLowerCase() === keyWord.toLowerCase() ? 
//         <Box component="span" key={index} sx={{ color: 'primary.main', fontWeight: 500 }}>
//           {part}
//         </Box> : 
//         part
//     );
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
//       <Container maxWidth="lg">
//         {/* Header */}
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 1 }}>
//             Ranking Causal-ish Paper Titles
//           </Typography>
//           <Typography variant="body1" sx={{ color: 'grey.600', mb: 2, lineHeight: 1.6 }}>
//             Drag and drop the different word options to rank them by strength of causal implication. The same sentence 
//             template is used with different causal words - rank from strongest to weakest causal implication.
//           </Typography>
          
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Typography variant="body2" sx={{ color: 'grey.500' }}>
//               Round 1 of 4
//             </Typography>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//               <People sx={{ fontSize: 16, color: 'grey.500' }} />
//               <Typography variant="body2" sx={{ color: 'grey.500' }}>
//                 3 participants so far
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         {/* Topic Section */}
//         <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
//           <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'grey.900', mb: 2 }}>
//             Topic: Sleep Deprivation and Memory Formation
//           </Typography>
//           <Typography variant="body1" sx={{ color: 'grey.600', mb: 3 }}>
//             Drag and drop the different word options to rank them by strength of causal implication.
//           </Typography>

//           {/* Ranking Area */}
//           <Box sx={{ 
//             border: '2px dashed', 
//             borderColor: 'grey.300', 
//             borderRadius: 2, 
//             p: 3,
//             bgcolor: 'grey.25'
//           }}>
//             {/* Strongest Label */}
//             <Box sx={{ mb: 2 }}>
//               <Chip 
//                 label="Strongest Causal Implication"
//                 sx={{ 
//                   bgcolor: 'error.main', 
//                   color: 'white',
//                   fontWeight: 500,
//                   fontSize: '0.875rem'
//                 }}
//               />
//             </Box>

//             {/* Draggable Cards */}
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//               {cards.map((card, index) => (
//                 <Paper
//                   key={card.id}
//                   draggable
//                   onDragStart={(e) => handleDragStart(e, index)}
//                   onDragOver={(e) => handleDragOver(e, index)}
//                   onDragLeave={handleDragLeave}
//                   onDrop={(e) => handleDrop(e, index)}
//                   elevation={draggedItem === index ? 1 : 2}
//                   sx={{
//                     p: 2,
//                     cursor: 'move',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 1.5,
//                     transition: 'all 0.2s ease',
//                     opacity: draggedItem === index ? 0.5 : 1,
//                     bgcolor: dragOverIndex === index ? 'primary.50' : 'white',
//                     borderColor: dragOverIndex === index ? 'primary.main' : 'grey.200',
//                     border: dragOverIndex === index ? '1px solid' : '1px solid transparent',
//                     '&:hover': {
//                       boxShadow: 3
//                     }
//                   }}
//                 >
//                   <DragIndicator sx={{ color: 'grey.400', fontSize: 20 }} />
                  
//                   <Box sx={{
//                     width: 32,
//                     height: 32,
//                     bgcolor: 'grey.600',
//                     color: 'white',
//                     borderRadius: '50%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     fontWeight: 500,
//                     fontSize: '0.875rem',
//                     flexShrink: 0
//                   }}>
//                     {index + 1}
//                   </Box>
                  
//                   <Box sx={{ flexGrow: 1 }}>
//                     <Typography 
//                       variant="body1" 
//                       sx={{ 
//                         color: 'grey.900', 
//                         fontStyle: 'italic', 
//                         mb: 0.5,
//                         lineHeight: 1.4
//                       }}
//                     >
//                       "{highlightKeyWord(card.text, card.keyWord)}"
//                     </Typography>
//                     <Typography variant="body2" sx={{ color: 'primary.main' }}>
//                       Key word: "{card.keyWord}"
//                     </Typography>
//                   </Box>
//                 </Paper>
//               ))}
//             </Box>

//             {/* Weakest Label */}
//             <Box sx={{ mt: 2 }}>
//               <Chip 
//                 label="Weakest Causal Implication"
//                 sx={{ 
//                   bgcolor: 'primary.main', 
//                   color: 'white',
//                   fontWeight: 500,
//                   fontSize: '0.875rem'
//                 }}
//               />
//             </Box>
//           </Box>
//         </Paper>

//         {/* Action Buttons */}
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Button
//             onClick={handleRestart}
//             startIcon={<RestartAlt />}
//             sx={{ 
//               color: 'grey.600',
//               '&:hover': {
//                 color: 'grey.800',
//                 bgcolor: 'transparent'
//               }
//             }}
//           >
//             Restart
//           </Button>

//           <Button
//             variant="contained"
//             endIcon={<ChevronRight />}
//             sx={{
//               bgcolor: 'primary.main',
//               fontWeight: 500,
//               px: 3,
//               py: 1,
//               '&:hover': {
//                 bgcolor: 'primary.dark'
//               }
//             }}
//           >
//             Submit Ranking
//           </Button>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default CausalRankingPage;
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  DragIndicator,
  RestartAlt,
  ChevronRight,
  ChevronLeft,
  People,
  Shuffle,
} from '@mui/icons-material';

const CausalRankingPage = () => {
  // All available causal keywords
  const [allKeyWords] = useState([
    "is associated with",
    "impairs", 
    "influences",
    "affects",
    "causes",
    "leads to",
    "results in",
    "triggers",
    "induces",
    "prevents",
    "enhances",
    "reduces",
    "increases",
    "decreases",
    "correlates with",
    "predicts",
    "determines",
    "contributes to",
    "facilitates",
    "inhibits"
  ]);

  // Define all rounds data
  const roundsData = [
    {
      id: 1,
      topic: "Sleep Deprivation and Memory Formation",
      template: "Sleep deprivation [KEY WORD] hippocampal memory consolidation in young adults"
    },
    {
      id: 2,
      topic: "Dopamine and Learning Behavior", 
      template: "Dopamine receptor activation [KEY WORD] reward-based learning in rats"
    },
    {
      id: 3,
      topic: "Stress Hormones and Cognitive Function",
      template: "Elevated cortisol [KEY WORD] age-related cognitive decline"
    },
    {
      id: 4,
      topic: "Neuroinflammation and Depression",
      template: "Microglial activation [KEY WORD] depressive-like behaviors in mice"
    }
  ];

  const [currentRound, setCurrentRound] = useState(0);
  const [roundKeyWords, setRoundKeyWords] = useState({});
  const [allCards, setAllCards] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Function to get 4 random unique keywords
  const getRandomKeyWords = () => {
    const shuffled = [...allKeyWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  // Initialize cards for all rounds with random keywords
  const initializeRounds = () => {
    const allRoundsCards = {};
    const allRoundsKeyWords = {};
    
    roundsData.forEach((round, roundIndex) => {
      const selectedKeyWords = getRandomKeyWords();
      allRoundsKeyWords[roundIndex] = selectedKeyWords;
      
      allRoundsCards[roundIndex] = selectedKeyWords.map((keyWord, index) => ({
        id: index + 1,
        text: round.template.replace("[KEY WORD]", keyWord),
        keyWord: keyWord,
        originalPosition: index + 1
      }));
    });
    
    return { allRoundsCards, allRoundsKeyWords };
  };

  // Initialize on component mount
  useEffect(() => {
    const { allRoundsCards, allRoundsKeyWords } = initializeRounds();
    setAllCards(allRoundsCards);
    setRoundKeyWords(allRoundsKeyWords);
  }, []);

  const currentCards = allCards[currentRound] || [];

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null) return;

    const newCards = [...currentCards];
    const draggedCard = newCards[draggedItem];
    
    // Remove the dragged item
    newCards.splice(draggedItem, 1);
    
    // Insert at new position
    newCards.splice(dropIndex, 0, draggedCard);
    
    // Update the cards for current round
    setAllCards(prev => ({
      ...prev,
      [currentRound]: newCards
    }));
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleRestart = () => {
    const resetCards = [...currentCards].sort((a, b) => a.originalPosition - b.originalPosition);
    setAllCards(prev => ({
      ...prev,
      [currentRound]: resetCards
    }));
  };

  const handleShuffleKeywords = () => {
    const newKeyWords = getRandomKeyWords();
    const newCards = newKeyWords.map((keyWord, index) => ({
      id: index + 1,
      text: roundsData[currentRound].template.replace("[KEY WORD]", keyWord),
      keyWord: keyWord,
      originalPosition: index + 1
    }));

    setRoundKeyWords(prev => ({
      ...prev,
      [currentRound]: newKeyWords
    }));

    setAllCards(prev => ({
      ...prev,
      [currentRound]: newCards
    }));
  };

  const handleNextRound = () => {
    if (currentRound < roundsData.length - 1) {
      setCurrentRound(currentRound + 1);
    }
  };

  const handlePreviousRound = () => {
    if (currentRound > 0) {
      setCurrentRound(currentRound - 1);
    }
  };

  const highlightKeyWord = (text, keyWord) => {
    const parts = text.split(new RegExp(`(${keyWord})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === keyWord.toLowerCase() ? 
        <Box component="span" key={index} sx={{ color: 'primary.main', fontWeight: 500 }}>
          {part}
        </Box> : 
        part
    );
  };

  const progress = ((currentRound + 1) / roundsData.length) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 1 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 0.25, fontSize: '1.4rem' }}>
            Ranking Causal-ish Paper Titles
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.600', mb: 1, lineHeight: 1.3, fontSize: '0.75rem' }}>
            Drag and drop the different word options to rank them by strength of causal implication.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'grey.500', fontSize: '0.7rem' }}>
              Round {currentRound + 1} of {roundsData.length}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <People sx={{ fontSize: 12, color: 'grey.500' }} />
              <Typography variant="body2" sx={{ color: 'grey.500', fontSize: '0.7rem' }}>
                3 participants so far
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 3, 
                borderRadius: 1.5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1.5
                }
              }} 
            />
          </Box>
        </Box>

        {/* Topic Section */}
        <Paper elevation={1} sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'grey.900', fontSize: '1rem' }}>
              Topic: {roundsData[currentRound]?.topic}
            </Typography>
            <Button
              onClick={handleShuffleKeywords}
              startIcon={<Shuffle sx={{ fontSize: 14 }} />}
              size="small"
              sx={{ 
                color: 'primary.main',
                fontSize: '0.7rem',
                px: 0.75,
                py: 0.25,
                minHeight: 24,
                '&:hover': {
                  bgcolor: 'primary.50'
                }
              }}
            >
              New Keywords
            </Button>
          </Box>

          {/* Current Keywords Display */}
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'grey.500', mb: 0.25, fontSize: '0.7rem' }}>
              Current keywords for this round:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap' }}>
              {(roundKeyWords[currentRound] || []).map((keyword, index) => (
                <Chip 
                  key={index}
                  label={keyword}
                  size="small"
                  sx={{ bgcolor: 'grey.100', color: 'grey.700', fontSize: '0.65rem', height: 18 }}
                />
              ))}
            </Box>
          </Box>

          {/* Ranking Area */}
          <Box sx={{ 
            border: '1px dashed', 
            borderColor: 'grey.300', 
            borderRadius: 1.5, 
            p: 1.5,
            bgcolor: 'grey.25'
          }}>
            {/* Strongest Label */}
            <Box sx={{ mb: 1 }}>
              <Chip 
                label="Strongest Causal Implication"
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  height: 20
                }}
              />
            </Box>

            {/* Draggable Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {currentCards.map((card, index) => (
                <Paper
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  elevation={draggedItem === index ? 1 : 1}
                  sx={{
                    p: 1,
                    cursor: 'move',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    transition: 'all 0.2s ease',
                    opacity: draggedItem === index ? 0.5 : 1,
                    bgcolor: dragOverIndex === index ? 'primary.50' : 'white',
                    borderColor: dragOverIndex === index ? 'primary.main' : 'grey.200',
                    border: dragOverIndex === index ? '1px solid' : '1px solid transparent',
                    '&:hover': {
                      boxShadow: 1
                    }
                  }}
                >
                  <DragIndicator sx={{ color: 'grey.400', fontSize: 16 }} />
                  
                  <Box sx={{
                    width: 20,
                    height: 20,
                    bgcolor: 'grey.600',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'grey.900', 
                        fontStyle: 'italic', 
                        mb: 0.1,
                        lineHeight: 1.2,
                        fontSize: '0.8rem'
                      }}
                    >
                      &quot;{highlightKeyWord(card.text, card.keyWord)}&quot;
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.7rem' }}>
                      Key word: &quot;{card.keyWord}&quot;
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Weakest Label */}
            <Box sx={{ mt: 1 }}>
              <Chip 
                label="Weakest Causal Implication"
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  height: 20
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <Button
              onClick={handleRestart}
              startIcon={<RestartAlt sx={{ fontSize: 14 }} />}
              size="small"
              sx={{ 
                color: 'grey.600',
                fontSize: '0.7rem',
                px: 1,
                py: 0.5,
                minHeight: 28,
                '&:hover': {
                  color: 'grey.800',
                  bgcolor: 'transparent'
                }
              }}
            >
              Restart
            </Button>

            {currentRound > 0 && (
              <Button
                onClick={handlePreviousRound}
                startIcon={<ChevronLeft sx={{ fontSize: 14 }} />}
                size="small"
                sx={{ 
                  color: 'grey.600',
                  fontSize: '0.7rem',
                  px: 1,
                  py: 0.5,
                  minHeight: 28,
                  '&:hover': {
                    color: 'grey.800',
                    bgcolor: 'transparent'
                  }
                }}
              >
                Previous Round
              </Button>
            )}
          </Box>

          <Box>
            {currentRound < roundsData.length - 1 ? (
              <Button
                onClick={handleNextRound}
                variant="contained"
                endIcon={<ChevronRight sx={{ fontSize: 14 }} />}
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.7rem',
                  minHeight: 28,
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Next Round
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<ChevronRight sx={{ fontSize: 14 }} />}
                size="small"
                sx={{
                  bgcolor: 'success.main',
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.7rem',
                  minHeight: 28,
                  '&:hover': {
                    bgcolor: 'success.dark'
                  }
                }}
              >
                Submit All Rankings
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CausalRankingPage;