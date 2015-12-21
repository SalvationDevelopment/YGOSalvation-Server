-- Goddess Erda's Guidance
-- Scripted by UnknownGuest
function c511000188.initial_effect(c)
    -- activate
    local e1=Effect.CreateEffect(c)
    e1:SetType(EFFECT_TYPE_ACTIVATE)
    e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
    e1:SetCode(EVENT_FREE_CHAIN)
    e1:SetCost(c511000188.setcost)
    e1:SetTarget(c511000188.settg)
    e1:SetOperation(c511000188.setop)
    c:RegisterEffect(e1)
end
function c511000188.cfilter(c)
	return c:IsType(TYPE_SPELL) and c:IsDiscardable()
end
function c511000188.setcost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c511000188.cfilter,tp,LOCATION_HAND,0,1,nil) end
    Duel.DiscardHand(tp,c511000188.cfilter,1,1,REASON_COST+REASON_DISCARD,nil)
end
function c511000188.filter(c)
    return c:IsType(TYPE_TRAP) and c:IsSSetable()
end
function c511000188.settg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetLocation()==LOCATION_GRAVE and chkc:GetControler()==tp and c511000188.filter(chkc) end
    if chk==0 then return Duel.GetLocationCount(tp,LOCATION_SZONE)>0
        and Duel.IsExistingMatchingCard(c511000188.filter,tp,LOCATION_GRAVE,0,1,nil) end
end
function c511000188.setop(e,tp,eg,ep,ev,re,r,rp)
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SET)
    local g=Duel.SelectMatchingCard(tp,c511000188.filter,tp,LOCATION_GRAVE,0,1,1,nil)
    if g:GetCount()>0 then
        Duel.SSet(tp,g:GetFirst())
        Duel.ConfirmCards(1-tp,g)
    end
end