--Blue-Eyes Radiance Dragon
-- CREDIT TO STORM WOLF
function c222.initial_effect(c)
        --xyz summon
        aux.AddXyzProcedure(c,aux.FilterBoolFunction(Card.IsRace,RACE_DRAGON),8,2)
        c:EnableReviveLimit()
        --cannot be target
        local e1=Effect.CreateEffect(c)
        e1:SetType(EFFECT_TYPE_SINGLE)
        e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
        e1:SetRange(LOCATION_MZONE)
        e1:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
        e1:SetCondition(c222.indcon)
        e1:SetValue(1)
        c:RegisterEffect(e1)
        --destroy
        local e2=Effect.CreateEffect(c)
        e2:SetCategory(CATEGORY_DESTROY)
        e2:SetType(EFFECT_TYPE_IGNITION)
        e2:SetRange(LOCATION_MZONE)
        e2:SetCountLimit(1)
        e2:SetCost(c222.descost)
        e2:SetTarget(c222.destg)
        e2:SetOperation(c222.desop)
        c:RegisterEffect(e2)
        --summon a Blue-Eyes
        local e3=Effect.CreateEffect(c)
        e3:SetDescription(aux.Stringid(222,0))
        e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
        e3:SetCountLimit(1,222)
        e3:SetType(EFFECT_TYPE_IGNITION)
        e3:SetRange(LOCATION_GRAVE)
        e3:SetCost(c222.spcost)
        e3:SetTarget(c222.sptg)
        e3:SetOperation(c222.spop)
        c:RegisterEffect(e3)
end
function c222.indcon(e)
        return e:GetHandler():GetOverlayGroup():IsExists(Card.IsCode,1,nil,89631139)
end
function c222.descost(e,tp,eg,ep,ev,re,r,rp,chk)
        if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,2,REASON_COST) end
        e:GetHandler():RemoveOverlayCard(tp,2,2,REASON_COST)
end
function c222.desfilter(c)
        return c:IsDestructable()
end
function c222.destg(e,tp,eg,ep,ev,re,r,rp,chk)
        if chk==0 then return Duel.IsExistingMatchingCard(c222.desfilter,tp,0,LOCATION_MZONE,1,nil) end
        local g=Duel.GetMatchingGroup(c222.desfilter,tp,0,LOCATION_MZONE,nil)
        Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c222.desop(e,tp,eg,ep,ev,re,r,rp)
        local g=Duel.GetMatchingGroup(c222.desfilter,tp,0,LOCATION_MZONE,nil)
        Duel.Destroy(g,REASON_EFFECT)
end
function c222.cfilter(c)
        return c:IsRace(RACE_DRAGON) and c:IsAbleToRemoveAsCost()
end
function c222.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
        if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost()
                and Duel.IsExistingMatchingCard(c222.cfilter,tp,LOCATION_GRAVE,0,1,nil) end
        Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
        local g=Duel.SelectMatchingCard(tp,c222.cfilter,tp,LOCATION_GRAVE,0,1,1,nil)
        g:AddCard(e:GetHandler())
        Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c222.spfilter(c,e,tp)
        return c:IsCanBeSpecialSummoned(e,0,tp,true,true) and c:IsCode(89631139) or c:IsCode(53347303) or c:IsCode(53183600) or c:IsCode(23995346) or c:IsCode(9433350)
                and not c:IsHasEffect(EFFECT_NECRO_VALLEY)
end
function c222.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
        if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
                and Duel.IsExistingMatchingCard(c222.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,nil,e,tp) end
        Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE)
end
function c222.spop(e,tp,eg,ep,ev,re,r,rp)
        if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
        Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
        local g=Duel.SelectMatchingCard(tp,c222.spfilter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil,e,tp)
        local c=e:GetHandler()
        local tc=g:GetFirst()
        if not tc then return end
        Duel.SpecialSummon(tc,0,tp,tp,true,true,POS_FACEUP)
end