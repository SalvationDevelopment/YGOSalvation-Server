--Aquarium Lightning
function c13720044.initial_effect(c)
	c:SetUniqueOnField(1,0,13720044)
    local e1=Effect.CreateEffect(c)
    e1:SetType(EFFECT_TYPE_ACTIVATE)
    e1:SetCode(EVENT_FREE_CHAIN)
    c:RegisterEffect(e1)
    --atk  
    local e2=Effect.CreateEffect(c)
    e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_QUICK_O)
    e2:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
    e2:SetRange(LOCATION_SZONE)
    e2:SetCost(c13720044.cost)
    e2:SetCondition(c13720044.atkcon)
    e2:SetOperation(c13720044.atkup)
    c:RegisterEffect(e2)
    local e3=Effect.CreateEffect(c)
    e3:SetDescription(aux.Stringid(56638325,1))
    e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
    e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
    e3:SetCode(EVENT_TO_GRAVE)
    e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
    e3:SetCondition(c13720044.spcon)
    e3:SetTarget(c13720044.sptg)
    e3:SetOperation(c13720044.spop)
    c:RegisterEffect(e3)
end
function c13720044.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(13720044)==0 end
	e:GetHandler():RegisterFlagEffect(13720044,RESET_PHASE+RESET_DAMAGE,0,1)
end
function c13720044.atkcon(e,tp,eg,ep,ev,re,r,rp)
        local a=Duel.GetAttacker()
        local d=Duel.GetAttackTarget()
        return (d~=nil and a:GetControler()==tp and a:IsSetCard(0x1373) and a:IsRelateToBattle())
                or (d~=nil and d:GetControler()==tp and d:IsFaceup() and d:IsSetCard(0x1373) and d:IsRelateToBattle())
end
function c13720044.atkup(e,tp,eg,ep,ev,re,r,rp)
        local a=Duel.GetAttacker()
        local d=Duel.GetAttackTarget()
        if not a:IsRelateToBattle() or not d:IsRelateToBattle() then return end
        local e1=Effect.CreateEffect(e:GetHandler())
        e1:SetOwnerPlayer(tp)
        e1:SetType(EFFECT_TYPE_SINGLE)
        e1:SetCode(EFFECT_SET_ATTACK_FINAL)
        e1:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
        if a:GetControler()==tp then
                e1:SetValue(a:GetAttack()*2)
                a:RegisterEffect(e1)
        else
                e1:SetValue(d:GetAttack()*2)
                d:RegisterEffect(e1)
        end
        local e1=Effect.CreateEffect(e:GetHandler())
        e1:SetOwnerPlayer(tp)
        e1:SetType(EFFECT_TYPE_SINGLE)
        e1:SetCode(EFFECT_SET_DEFENCE_FINAL)
        e1:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
        if a:GetControler()==tp then
                e1:SetValue(a:GetDefence()*2)
                a:RegisterEffect(e1)
        else
                e1:SetValue(d:GetDefence()*2)
                d:RegisterEffect(e1)
        end
end
 
 
function c13720044.spcon(e,tp,eg,ep,ev,re,r,rp)
        return e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c13720044.spfilter(c,e,tp)
        return c:IsRace(RACE_AQUA) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13720044.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
        if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
                and Duel.IsExistingTarget(c13720044.spfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
        local g=Duel.SelectTarget(tp,c13720044.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
        Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_GRAVE)
end
function c13720044.spop(e,tp,eg,ep,ev,re,r,rp)
        if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
		local tc=Duel.GetFirstTarget()
		if tc:IsRelateToEffect(e) then
                Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
                local e1=Effect.CreateEffect(e:GetHandler())
                e1:SetType(EFFECT_TYPE_FIELD)
                e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
                e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
                e1:SetTargetRange(1,0)
                e1:SetTarget(c13720044.splimit)
                e1:SetReset(RESET_PHASE+PHASE_END)
                Duel.RegisterEffect(e1,tp)
			end
		end

function c13720044.splimit(e,c)
        return c:GetRace()~=RACE_AQUA
end
