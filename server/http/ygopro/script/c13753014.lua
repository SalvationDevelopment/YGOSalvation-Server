--Dice Roll Battle
function c13753014.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetHintTiming(0,TIMING_BATTLE_START)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c13753014.condition)
	e1:SetTarget(c13753014.target)
	e1:SetOperation(c13753014.operation)
	c:RegisterEffect(e1)
	
	local e1=Effect.CreateEffect(c)
	e1:SetHintTiming(0,TIMING_BATTLE_END)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetRange(LOCATION_GRAVE)
	e1:SetCondition(c13753014.condition2)
	e1:SetTarget(c13753014.target2)
	e1:SetOperation(c13753014.activate2)
	c:RegisterEffect(e1)
end
function c13753014.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp
end
function c13753014.filter(c,e,tp)
	local lv=c:GetLevel()
	return c:IsSetCard(0x2016) and c:IsAbleToRemove()
		and Duel.IsExistingMatchingCard(c13753014.filter2,tp,LOCATION_HAND,0,1,nil,e,tp,c:GetLevel())
end
function c13753014.filter2(c,e,tp,lv)
	return c:IsSetCard(0x2016) and c:IsType(TYPE_TUNER) and c:IsAbleToRemove()
		and Duel.IsExistingMatchingCard(c13753014.synfilter,tp,LOCATION_EXTRA,0,1,nil,e,tp,lv+c:GetLevel())
end
function c13753014.synfilter(c,e,tp,lv)
	return c:GetLevel()==lv and c:IsType(TYPE_SYNCHRO)
end
function c13753014.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c13753014.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c13753014.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c13753014.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c13753014.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local tc=Duel.GetFirstTarget()
	local lv1=tc:GetLevel()
	if tc:IsRelateToEffect(e) and Duel.IsExistingMatchingCard(c13753014.filter2,tp,LOCATION_HAND,0,1,nil,e,tp,tc:GetLevel()) then
	local g=Duel.SelectMatchingCard(tp,c13753014.filter2,tp,LOCATION_HAND,0,1,1,nil,e,tp,lv1)
	local tc2=g:GetFirst() 
	local lv2=tc2:GetLevel()
	local lv=lv1+lv2
	local m=Group.FromCards(tc,tc2)
		if Duel.Remove(m,POS_FACEUP,REASON_EFFECT)==2 then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
			local sg=Duel.SelectMatchingCard(tp,c13753014.synfilter,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,lv)
			if sg:GetCount()>0 then
				Duel.SpecialSummon(sg,0,tp,tp,false,false,POS_FACEUP)
			end
		end
	end
end

function c13753014.condition2(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp and Duel.GetCurrentPhase()==PHASE_BATTLE
end

function c13753014.sfilter(c)
	return c:IsFaceup() and c:IsPosition(POS_FACEUP_ATTACK) and c:IsType(TYPE_SYNCHRO)
end
function c13753014.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return Duel.IsExistingTarget(c13753014.sfilter,tp,0,LOCATION_MZONE,1,nil)
		and Duel.IsExistingTarget(c13753014.sfilter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONTROL)
	local g2=Duel.SelectTarget(tp,c13753014.sfilter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONTROL)
	local g1=Duel.SelectTarget(tp,c13753014.sfilter,tp,LOCATION_MZONE,0,1,1,nil)
	g1:Merge(g2)
	Duel.SetOperationInfo(0,CATEGORY_CONTROL,g1,2,0,0)
end
function c13753014.activate2(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local a=g:GetFirst()
	local b=g:GetNext()
	if a:IsAttackable() and not a:IsImmuneToEffect(e) and not a:IsImmuneToEffect(e) then
		Duel.CalculateDamage(a,b)
	end
end
