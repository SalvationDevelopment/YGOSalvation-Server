--Ilusion Gate
function c100000083.initial_effect(c)
    --Activate
    local e1=Effect.CreateEffect(c)
    e1:SetCategory(CATEGORY_DESTROY)
    e1:SetType(EFFECT_TYPE_ACTIVATE)
    e1:SetCode(EVENT_FREE_CHAIN)
    e1:SetTarget(c100000083.target)
    e1:SetOperation(c100000083.activate)
    c:RegisterEffect(e1)
end
function c100000083.filter(c,e,tp)
    return c:IsType(TYPE_MONSTER) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c100000083.target(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDestructable,tp,0,LOCATION_MZONE,1,nil) end
    local sg=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_MZONE,nil)
    Duel.SetOperationInfo(0,CATEGORY_DESTROY,sg,sg:GetCount(),0,0)
end
function c100000083.activate(e,tp,eg,ep,ev,re,r,rp)
    local c=e:GetHandler()
    local sg=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_MZONE,nil)
    Duel.Destroy(sg,REASON_EFFECT)
    Duel.BreakEffect()
    if chk==0 then return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>0
        and     Duel.IsExistingMatchingCard(c100000083.filter,tp,0,LOCATION_GRAVE,1,nil,e) end
    Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_GRAVE)
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
    local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
    if ft<=0 then return end
    local tc1=Duel.SelectMatchingCard(tp,c100000083.filter,tp,0,LOCATION_GRAVE,1,1,nil,e,tp)
    if tc1 then
        Duel.SpecialSummon(tc1,1,tp,tp,true,true,POS_FACEUP)
        local lp=Duel.GetLP(tp)
        if lp<=7200 then
            Duel.SetLP(tp,0)
        else
            Duel.SetLP(tp,lp-7200)
        end
    end
 end