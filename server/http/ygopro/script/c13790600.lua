--Side Effect?
function c13790600.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetOperation(c58577036.operation)
	c:RegisterEffect(e1)
end
function c58577036.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,1-tp,567)
	local lv=Duel.AnnounceNumber(1-tp,1,2,3)
	local lp=Duel.Draw(1-tp,lv,REASON_EFFECT)
	Duel.Recover(tp,lp*2000,REASON_EFFECT)
end

