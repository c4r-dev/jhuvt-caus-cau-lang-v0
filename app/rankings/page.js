'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

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
  const [showResults, setShowResults] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]);
  
  // Matrix for storing pairwise comparisons
  const [comparisonMatrix, setComparisonMatrix] = useState(() => {
    const n = 20; // number of words
    return Array(n).fill().map(() => Array(n).fill(0));
  });

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

  // Enhanced function to update comparison matrix with debugging
  const updateComparisonMatrix = (rankedCards) => {
    console.log('=== UPDATING MATRIX ===');
    console.log('Round:', currentRound + 1);
    console.log('User ranking:', rankedCards.map(card => card.keyWord));
    
    const newMatrix = comparisonMatrix.map(row => [...row]);
    const wordIndices = rankedCards.map(card => allKeyWords.indexOf(card.keyWord));
    
    console.log('Word indices:', wordIndices);
    
    // Track each pairwise comparison
    const comparisons = [];
    const matrixUpdates = [];
    
    // Generate all pairwise comparisons (6 comparisons for 4 words)
    for (let i = 0; i < wordIndices.length; i++) {
      for (let j = i + 1; j < wordIndices.length; j++) {
        const higherRankedWordIndex = wordIndices[i]; // word ranked higher (more causal)
        const lowerRankedWordIndex = wordIndices[j];  // word ranked lower (less causal)
        
        const higherWord = allKeyWords[higherRankedWordIndex];
        const lowerWord = allKeyWords[lowerRankedWordIndex];
        
        comparisons.push(`${higherWord} > ${lowerWord}`);
        matrixUpdates.push({
          from: higherWord,
          to: lowerWord,
          position: `[${higherRankedWordIndex}][${lowerRankedWordIndex}]`,
          oldValue: newMatrix[higherRankedWordIndex][lowerRankedWordIndex],
          newValue: newMatrix[higherRankedWordIndex][lowerRankedWordIndex] + 1
        });
        
        // Increment matrix element a_ij where i is more causal than j
        newMatrix[higherRankedWordIndex][lowerRankedWordIndex]++;
      }
    }
    
    console.log('Pairwise comparisons:', comparisons);
    console.log('Matrix updates:', matrixUpdates);
    
    // Store round history for debugging
    const roundData = {
      round: currentRound + 1,
      ranking: rankedCards.map(card => card.keyWord),
      comparisons,
      matrixUpdates
    };
    
    setRoundHistory(prev => [...prev, roundData]);
    setComparisonMatrix(newMatrix);
    
    console.log('Updated matrix:', newMatrix);
  };

  // Calculate final rankings based on matrix row sums
  const calculateFinalRankings = () => {
    const rowSums = comparisonMatrix.map((row, index) => ({
      word: allKeyWords[index],
      score: row.reduce((sum, val) => sum + val, 0),
      index: index
    }));
    
    console.log('Row sums (total wins):', rowSums);
    
    // Sort by score (descending) - higher score means more causal
    return rowSums.sort((a, b) => b.score - a.score);
  };

  // Debug function to show matrix
  const showMatrixDebug = () => {
    console.log('=== CURRENT MATRIX STATE ===');
    console.table(comparisonMatrix);
    
    // Show row sums
    const rowSums = comparisonMatrix.map((row, index) => ({
      word: allKeyWords[index],
      wins: row.reduce((sum, val) => sum + val, 0)
    }));
    
    console.log('Row sums (total wins):', rowSums);
    
    // Show matrix as formatted table
    const matrixDisplay = comparisonMatrix.map((row, i) => {
      const obj = { word: allKeyWords[i] };
      row.forEach((val, j) => {
        obj[allKeyWords[j]] = val;
      });
      obj.totalWins = row.reduce((sum, val) => sum + val, 0);
      return obj;
    });
    
    console.table(matrixDisplay);
  };

  // Test function to verify specific scenarios
  const testRankingScenario = () => {
    console.log('=== TESTING RANKING SCENARIO ===');
    
    // Reset matrix for testing
    const testMatrix = Array(20).fill().map(() => Array(20).fill(0));
    
    // Simulate known rankings
    const testRounds = [
      ['causes', 'influences', 'affects', 'correlates with'],
      ['influences', 'causes', 'leads to', 'affects'],
      ['causes', 'leads to', 'influences', 'triggers']
    ];
    
    console.log('Test rounds:', testRounds);
    
    testRounds.forEach((ranking, roundIndex) => {
      console.log(`Processing test round ${roundIndex + 1}:`, ranking);
      const indices = ranking.map(word => allKeyWords.indexOf(word));
      
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          testMatrix[indices[i]][indices[j]]++;
          console.log(`${ranking[i]} beats ${ranking[j]} -> matrix[${indices[i]}][${indices[j]}]++`);
        }
      }
    });
    
    // Calculate expected results
    const testRowSums = testMatrix.map((row, index) => ({
      word: allKeyWords[index],
      wins: row.reduce((sum, val) => sum + val, 0)
    })).filter(item => item.wins > 0).sort((a, b) => b.wins - a.wins);
    
    console.log('Test results:', testRowSums);
  };

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
    const shuffledCards = [...currentCards].sort(() => 0.5 - Math.random());
    setAllCards(prev => ({
      ...prev,
      [currentRound]: shuffledCards
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
    // Update matrix with current round's ranking before moving to next round
    updateComparisonMatrix(currentCards);
    
    if (currentRound < roundsData.length - 1) {
      setCurrentRound(currentRound + 1);
    }
  };

  const handlePreviousRound = () => {
    if (currentRound > 0) {
      setCurrentRound(currentRound - 1);
    }
  };

  const handleSubmitAllRankings = () => {
    // Update matrix with final round's ranking
    updateComparisonMatrix(currentCards);
    // Show results
    setShowResults(true);
  };

  const handleStartNewSession = () => {
    // Reset everything
    setCurrentRound(0);
    setShowResults(false);
    setComparisonMatrix(Array(20).fill().map(() => Array(20).fill(0)));
    setRoundHistory([]);
    const { allRoundsCards, allRoundsKeyWords } = initializeRounds();
    setAllCards(allRoundsCards);
    setRoundKeyWords(allRoundsKeyWords);
  };

  const highlightKeyWord = (text, keyWord) => {
    const parts = text.split(new RegExp(`(${keyWord})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === keyWord.toLowerCase() ? 
        <Box component="span" key={index} sx={{ color: 'primary.main', fontWeight: 600 }}>
          {part}
        </Box> : 
        part
    );
  };

  // Debug Panel Component
  const DebugPanel = () => (
    <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>🔧 Debug Panel</Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={showMatrixDebug}
          sx={{ textTransform: 'none' }}
        >
          Show Matrix in Console
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testRankingScenario}
          sx={{ textTransform: 'none' }}
        >
          Test Scenario
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => console.log('Round History:', roundHistory)}
          sx={{ textTransform: 'none' }}
        >
          Show History
        </Button>
      </Box>

      {roundHistory.length > 0 && (
        <Accordion>
          <AccordionSummary sx={{ bgcolor: 'white' }}>
            <Typography variant="subtitle2">
              Round History ({roundHistory.length} rounds completed)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'white' }}>
            {roundHistory.map((round, index) => (
              <Box key={index} sx={{ mb: 2, p: 1, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Round {round.round}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Ranking:</strong> {round.ranking.join(' > ')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Comparisons:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                  {round.comparisons.map((comp, i) => (
                    <Chip 
                      key={i} 
                      label={comp} 
                      size="small" 
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" sx={{ color: 'grey.600' }}>
                  Matrix updates: {round.matrixUpdates.length} cells incremented
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );

  // Results Component
  const ResultsPage = () => {
    const finalRankings = calculateFinalRankings();
    
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 1 }}>
              Causal Word Rankings
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography sx={{ color: 'grey.500' }}>👥</Typography>
              <Typography variant="body2" sx={{ color: 'grey.500' }}>
                Based on {roundsData.length} rounds completed
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'grey.600', mb: 2 }}>
              Words ranked by perceived strength of causal implication across all contexts.
            </Typography>
          </Box>

          {/* Debug toggle for results */}
          {/* <Box sx={{ mb: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setDebugMode(!debugMode)}
              sx={{ textTransform: 'none' }}
            >
              {debugMode ? 'Hide' : 'Show'} Debug Info
            </Button>
          </Box> */}

          {/* Debug Panel in Results */}
          {debugMode && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.100' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>🔍 Final Results Debug</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  console.log('=== FINAL RESULTS DEBUG ===');
                  console.log('Final rankings:', finalRankings);
                  console.log('Complete round history:', roundHistory);
                  showMatrixDebug();
                }}
                sx={{ textTransform: 'none', mb: 2 }}
              >
                Export Debug Data to Console
              </Button>
              
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Total comparisons made: {roundHistory.reduce((sum, round) => sum + round.comparisons.length, 0)}
              </Typography>
            </Paper>
          )}

          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderBottom: 1, borderColor: 'grey.200' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'grey.900' }}>
                Final Word Rankings (Strongest → Weakest Causal Implication)
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'grey.700', width: 80 }}>RANK</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>WORD/PHRASE</TableCell>
                    {debugMode && (
                      <TableCell sx={{ fontWeight: 600, color: 'grey.700', width: 100 }}>SCORE</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {finalRankings.map((item, index) => (
                    <TableRow 
                      key={item.index}
                      sx={{ 
                        '&:nth-of-type(even)': { bgcolor: 'grey.25' },
                        '&:hover': { bgcolor: 'primary.50' },
                        borderBottom: 1,
                        borderColor: 'grey.100'
                      }}
                    >
                      <TableCell>
                        <Box sx={{
                          width: 28,
                          height: 28,
                          bgcolor: index < 3 ? 'primary.main' : 'grey.600',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}>
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: index < 3 ? 600 : 400,
                            color: index < 3 ? 'grey.900' : 'grey.700'
                          }}
                        >
                          &quot;{item.word}&quot;
                        </Typography>
                      </TableCell>
                      {debugMode && (
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'grey.600' }}>
                            {item.score} wins
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
              Understanding the Rankings
            </Typography>
            <Typography variant="body1" sx={{ color: 'grey.600', mb: 3 }}>
              These rankings show how participants collectively perceived the causal strength of different words across various scientific 
              contexts. Words at the top were consistently ranked as implying stronger causal relationships, while those at the bottom were 
              seen as more correlational or descriptive.
            </Typography>
            
            <Button
              onClick={handleStartNewSession}
              variant="contained"
              startIcon={<span>▶</span>}
              sx={{
                bgcolor: 'primary.main',
                fontWeight: 500,
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              Start New Session
            </Button>
          </Box>
        </Container>
      </Box>
    );
  };

  // Show results page if completed
  if (showResults) {
    return <ResultsPage />;
  }

  const progress = ((currentRound + 1) / roundsData.length) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 2 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 0.5 }}>
            Ranking Causal-ish Paper Titles
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.600', mb: 1.5, lineHeight: 1.4 }}>
            Drag and drop the different word options to rank them by strength of causal implication. The same sentence 
            template is used with different causal words - rank from strongest to weakest causal implication.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              Round {currentRound + 1} of {roundsData.length}
            </Typography>
            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setDebugMode(!debugMode)}
                sx={{ textTransform: 'none' }}
              >
                {debugMode ? 'Hide' : 'Show'} Debug
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ color: 'grey.500' }}>👥</Typography>
                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  3 participants so far
                </Typography>
              </Box>
            </Box> */}
          </Box>

          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 1,
              bgcolor: 'grey.200',
              mb: 2,
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                bgcolor: 'primary.main'
              }
            }} 
          />
        </Box>

        {/* Debug Panel */}
        {debugMode && <DebugPanel />}

        {/* Topic Section */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'grey.900' }}>
              Topic: {roundsData[currentRound]?.topic}
            </Typography>
            <Button
              onClick={handleShuffleKeywords}
              startIcon={<span>🔀</span>}
              sx={{ 
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'primary.50'
                }
              }}
            >
              New Keywords
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ color: 'grey.600', mb: 1.5 }}>
            Drag and drop the different word options to rank them by strength of causal implication.
          </Typography>

          {/* Current Keywords Display */}
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>
              Current keywords for this round:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(roundKeyWords[currentRound] || []).map((keyword, index) => (
                <Chip 
                  key={index}
                  label={keyword}
                  size="small"
                  sx={{ bgcolor: 'grey.100', color: 'grey.700', fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>

          {/* Ranking Area */}
          <Box sx={{ 
            border: '2px dashed', 
            borderColor: 'grey.300', 
            borderRadius: 2, 
            p: 1.5,
            bgcolor: 'grey.25'
          }}>
            {/* Strongest Label */}
            <Box sx={{ mb: 1.5 }}>
              <Chip 
                label="Strongest Causal Implication"
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
            </Box>

            {/* Draggable Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {currentCards.map((card, index) => (
                <Paper
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  elevation={draggedItem === index ? 1 : 2}
                  sx={{
                    p: 1.5,
                    cursor: 'move',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    transition: 'all 0.2s ease',
                    opacity: draggedItem === index ? 0.5 : 1,
                    bgcolor: dragOverIndex === index ? 'primary.50' : 'white',
                    borderColor: dragOverIndex === index ? 'primary.main' : 'grey.200',
                    border: dragOverIndex === index ? 1 : 0,
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                >
                  <Typography sx={{ color: 'grey.400', fontSize: '1.25rem', userSelect: 'none' }}>
                    ⋮⋮
                  </Typography>
                  
                  <Box sx={{
                    width: 24,
                    height: 24,
                    bgcolor: 'grey.600',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                    fontSize: '0.75rem',
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
                        mb: 0.5,
                        lineHeight: 1.4
                      }}
                    >
                      &quot;{highlightKeyWord(card.text, card.keyWord)}&quot;
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main' }}>
                      Key word: &quot;{card.keyWord}&quot;
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Weakest Label */}
            <Box sx={{ mt: 1.5 }}>
              <Chip 
                label="Weakest Causal Implication"
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              onClick={handleRestart}
              startIcon={<span>↻</span>}
              sx={{ 
                color: 'grey.600',
                textTransform: 'none',
                fontWeight: 500,
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
                startIcon={<span>←</span>}
                sx={{ 
                  color: 'grey.600',
                  textTransform: 'none',
                  fontWeight: 500,
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
                endIcon={<span>→</span>}
                sx={{
                  bgcolor: 'primary.main',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Next Round
              </Button>
            ) : (
              <Button
                onClick={handleSubmitAllRankings}
                variant="contained"
                endIcon={<span>→</span>}
                sx={{
                  bgcolor: 'success.main',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
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