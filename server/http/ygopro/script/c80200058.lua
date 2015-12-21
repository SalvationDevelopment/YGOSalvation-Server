--ＲＵＭ－七皇の剣
function c80200058.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80200058.condition)
	e1:SetCost(c80200058.cost)
	e1:SetTarget(c80200058.target)
	e1:SetOperation(c80200058.activate)
	c:RegisterEffect(e1)
	--register
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_DRAW)
	e2:SetRange(LOCATION_HAND)
	e2:SetOperation(c80200058.regop)
	c:RegisterEffect(e2)
end
function c80200058.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80200058)==0 end
	Duel.RegisterFlagEffect(tp,80200058,0,0,0)
end
function c80200058.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()==PHASE_MAIN1 and not Duel.CheckPhaseActivity() and e:GetHandler():GetFlagEffect(80200058)==1 
end
function c80200058.filter1(c,e,tp)
	return c:IsCanBeSpecialSummoned(e,0,tp,false,false) and
		Duel.IsExistingMatchingCard(c80200058.filter2,tp,LOCATION_EXTRA,0,1,nil,e,tp,c:GetCode())
end
function c80200058.filter2(c,e,tp,code)
	local class=_G["c"..c:GetCode()]
	return class~=nil and class.rankdown==code and c:IsCanBeSpecialSummoned(e,0,tp,false,true)
end
function c80200058.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80200058.filter1,tp,LOCATION_EXTRA+LOCATION_GRAVE,0,1,nil,e,tp)
		and (not Duel.IsPlayerAffectedByEffect(tp,23516703) or c23516703[tp]==0)
		end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA+LOCATION_GRAVE)
end
function c80200058.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local tc=Duel.SelectMatchingCard(tp,c80200058.filter1,tp,LOCATION_GRAVE+LOCATION_EXTRA,0,1,1,nil,e,tp):GetFirst()
	if tc then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
		Duel.BreakEffect()
		local g=Duel.SelectMatchingCard(tp,c80200058.filter2,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,tc:GetCode())	
		local sc=g:GetFirst()
		if sc then
			Duel.Overlay(sc,Group.FromCards(tc))
			Duel.SpecialSummon(sc,SUMMON_TYPE_XYZ,tp,tp,false,false,POS_FACEUP)
			sc:CompleteProcedure()
		end
	end
end
function c80200058.regop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if ep==tp and r==REASON_RULE and Duel.GetCurrentPhase()==PHASE_DRAW and eg:IsContains(c) and not c:IsPublic() 
		and Duel.SelectYesNo(tp,aux.Stringid(80200058,0)) then
		Duel.Hint(HINT_CARD,0,80200058)
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_PUBLIC)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		c:RegisterEffect(e1)
		c:RegisterFlagEffect(80200058,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	end
end