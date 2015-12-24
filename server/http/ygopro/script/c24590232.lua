--王魂調和
function c24590232.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c24590232.condition)
	e1:SetOperation(c24590232.activate)
	c:RegisterEffect(e1)
end
function c24590232.condition(e,tp,eg,ep,ev,re,r,rp)
	return eg:GetFirst():IsControler(1-tp) and Duel.GetAttackTarget()==nil
end
function c24590232.filter1(c,e,tp)
	local lv=c:GetLevel()
	return c:IsType(TYPE_SYNCHRO) and lv<9 and c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_SYNCHRO,tp,false,false)
		and Duel.IsExistingMatchingCard(c24590232.filter2,tp,LOCATION_GRAVE,0,1,nil,c,tp)
end
function c24590232.filter2(c,cs,tp)
	if c:IsType(TYPE_TUNER) and c:GetLevel()<cs:GetLevel() and c:IsCanBeSynchroMaterial() and c:IsAbleToRemove() then
		local lv=cs:GetLevel()-c:GetLevel()
		local g=Group.CreateGroup()
		g:AddCard(c)
		return Duel.IsExistingMatchingCard(c24590232.filter3,tp,LOCATION_GRAVE,0,1,nil,cs,c,tp,lv,g)
	else
		return false
	end
end
function c24590232.filter3(c,cs,ct,tp,lv,g)
	if c:IsType(TYPE_TUNER) or c:GetLevel()>lv or not c:IsCanBeSynchroMaterial() or not c:IsAbleToRemove() then return false end
	local gr=Group.CreateGroup()
	local tg=g:GetFirst()
	while tg do
		if c==tg then
			return false
		else
			gr:AddCard(tg)
			tg=g:GetNext()
		end
	end
	gr:AddCard(c)
	if c:GetLevel()==lv then
		return c24590232.areValidMats(cs,ct,tp,gr)
	else
		local lvr=lv-c:GetLevel()
		return Duel.IsExistingMatchingCard(c24590232.filter3,tp,LOCATION_GRAVE,0,1,nil,cs,ct,tp,lvr,gr)
	end
end
function c24590232.areValidMats(cs,ct,tp,mg)
	local gs=Duel.GetMatchingGroup(Card.IsSynchroSummonable,tp,LOCATION_EXTRA,0,nil,ct,mg)
	if gs:GetCount()>0 then
		local ts=gs:GetFirst()
		while ts do
			if cs==ts then return true end
			ts=gs:GetNext()
		end
	end
	return false
end
function c24590232.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if Duel.NegateAttack() and Duel.GetLocationCount(tp,LOCATION_MZONE)>1
		and Duel.IsExistingMatchingCard(c24590232.filter1,tp,LOCATION_EXTRA,0,1,nil,e,tp)
		and Duel.SelectYesNo(tp,aux.Stringid(24590232,0)) then
		Duel.BreakEffect()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local g1=Duel.SelectMatchingCard(tp,c24590232.filter1,tp,LOCATION_EXTRA,0,1,1,nil,e,tp)
		local tg1=g1:GetFirst()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		local g2=Duel.SelectMatchingCard(tp,c24590232.filter2,tp,LOCATION_GRAVE,0,1,1,nil,tg1,tp)
		local tg2=g2:GetFirst()
		local lv=tg1:GetLevel()-tg2:GetLevel()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		while lv>0 do
			local g3=Duel.SelectMatchingCard(tp,c24590232.filter3,tp,LOCATION_GRAVE,0,1,1,nil,tg1,tg2,tp,lv,g2)
			local tg3=g3:GetFirst()
			g2:AddCard(tg3)
			lv=lv-tg3:GetLevel()
		end
		Duel.Remove(g2,POS_FACEUP,REASON_EFFECT+REASON_SYNCHRO+REASON_MATERIAL)
		Duel.SpecialSummon(g1,SUMMON_TYPE_SYNCHRO,tp,tp,false,false,POS_FACEUP)
	end
end