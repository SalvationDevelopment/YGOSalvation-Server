--Multiple Destruction
function c13716005.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_HANDES+CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13716005)
	e1:SetCondition(c13716005.condition)
	e1:SetOperation(c13716005.activate)
	c:RegisterEffect(e1)
end
function c13716005.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetFieldGroupCount(tp,LOCATION_HAND,0)>=3
		and Duel.GetFieldGroupCount(tp,0,LOCATION_HAND)>=3
end
function c13716005.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.BreakEffect()
	Duel.Hint(HINT_SELECTMSG,1-tp,HINTMSG_TODECK)
	local g=Duel.GetFieldGroup(tp,LOCATION_HAND,LOCATION_HAND)
	Duel.SendtoDeck(g,nil,1,REASON_EFFECT)
	local og=Duel.GetOperatedGroup()
	local ct=og:GetCount()
	local lp=Duel.GetLP(tp)
	if ct>0 and Duel.SetLP(tp,lp-ct*300)~=0 then
		Duel.Draw(tp,5,REASON_EFFECT)
		Duel.Draw(1-tp,5,REASON_EFFECT)
	end
end

