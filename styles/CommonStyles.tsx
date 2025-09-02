import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#F5F5F5',
    },
    backButton: {
      marginRight: 15,
    },
    headerTitle: {
      fontSize: 40,
      fontWeight: 'bold',
      color: '#1A346F',
      flex: 1,
    },
    headerYear: {
      fontSize: 40,
      fontWeight: 'bold',
      color: '#1A346F',
    },
    mainContent: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 30,
      paddingTop: 10,
      paddingBottom: 40,
    },
    // 빈 화면 스타일
    emptyScreen: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
    },
    emptyScreenTitle: {
      fontSize: 40,
      fontWeight: 'bold',
      color: '#1A346F',
      marginBottom: 20,
    },
    emptyScreenText: {
      fontSize: 20,
      color: '#666',
      textAlign: 'center',
    },
    calendarContainer: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      paddingBottom: 10,
      marginRight: 15,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    monthTitle: {
      fontSize: 25,
      fontWeight: 'bold',
      color: '#1A346F',
    },
    weekDaysContainer: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    weekDayCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
    },
    weekDayText: {
      fontSize: 16,
      color: '#666',
      fontWeight: '600',
    },
    sundayText: {
      color: '#FF6B6B',
    },
    saturdayText: {
      color: '#4A90E2',
    },
    calendarScrollView: {
      flex: 1,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dateCell: {
      width: '14.28%',
      minHeight: 80, // 높이를 줄여서 주차 간격 축소
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 8,
      paddingHorizontal: 2,
      marginBottom: 8, // 마진 축소
    },
    dateCellContent: {
      width: '100%',
      alignItems: 'center',
      flex: 1,
    },
    selectedDateCell: {
      backgroundColor: 'transparent',
    },
    selectedDateBackground: {
      backgroundColor: '#E53E3E',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    dateText: {
      fontSize: 18,
      color: '#333',
      fontWeight: '600',
    },
    selectedDateText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
    },
    highlightedDate: {
      color: '#FF6B6B',
      fontWeight: 'bold',
    },
    scheduleBoxContainer: {
      width: '100%',
      marginTop: 4, // 마진 축소
      paddingHorizontal: 2,
    },
    scheduleBox: {
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
      marginBottom: 1, // 마진 축소
      minHeight: 16, // 높이 축소
      justifyContent: 'center',
    },
    scheduleBoxText: {
      fontSize: 8, // 폰트 크기 축소
      fontWeight: '500',
      textAlign: 'center',
    },
    moreScheduleBox: {
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
      backgroundColor: '#F5F5F5',
      marginBottom: 1,
      minHeight: 16,
      justifyContent: 'center',
    },
    moreScheduleText: {
      fontSize: 8,
      color: '#666',
      textAlign: 'center',
      fontWeight: '500',
    },
    scheduleContainer: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      paddingBottom: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    scheduleTitle: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#1A346F',
      marginBottom: 20,
    },
    scheduleItem: {
      borderRadius: 12,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
    },
    holidayContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    holidayIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    holidayTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    scheduleContent: {
      gap: 8,
    },
    scheduleTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    scheduleTime: {
      fontSize: 14,
      fontWeight: '500',
    },
    scheduleItemTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    scheduleList: {
      flex: 1,
    },
    noScheduleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 150,
    },
    noScheduleText: {
      fontSize: 25,
      fontWeight: 'bold',
      color: '#999',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: 'white',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: '#E8E8E8',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    tabText: {
      fontSize: 11,
      color: '#999',
    },
    activeTabText: {
      color: '#4A90E2',
    },
});

export default CommonStyles;