--Rank-Up-Magic Raptor's Force
function c13790507.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(TIMING_END_PHASE)
	e1:SetTarget(c13790507.target)
	e1:SetOperation(c13790507.activate)
	c:RegisterEffect(e1)
end
function c13790507.filter1(c,tid)
	local rk=c:GetRank()
	return c:IsReason(REASON_DESTROY) and c:IsType(TYPE_MONSTER) and c:GetTurnID()==tid
		and Duel.IsExistingMatchingCard(c13790507.filter2,tp,LOCATION_EXTRA,0,1,nil,e,tp,c,rk+1,c:GetCode())
end
function c13790507.filter2(c,e,tp,mc,rk,code)
	return c:GetRank()==rk and c:IsSetCard(0xba)
end
function c13790507.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and c13790507.filter1(chkc,Duel.GetTurnCount()) end
	if chk==0 then return Duel.IsExistingTarget(c13790507.filter1,tp,LOCATION_GRAVE,0,1,nil,Duel.GetTurnCount()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c13790507.filter1,tp,LOCATION_GRAVE,0,1,1,nil,Duel.GetTurnCount())
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,g:GetCount(),0,0)
end
function c13790507.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<0 then return end
	local tc=Duel.GetFirstTarget()
	if Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)==0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13790507.filter2,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,tc,tc:GetRank()+1,tc:GetCode())
	local sc=g:GetFirst()
	if sc then
		local mg=tc:GetOverlayGroup()
		if mg:GetCount()~=0 then
			Duel.Overlay(sc,mg)
		end
		Duel.Overlay(sc,Group.FromCards(tc))
		Duel.SpecialSummon(sc,SUMMON_TYPE_XYZ,tp,tp,false,false,POS_FACEUP)
		sc:CompleteProcedure()
	end
end
